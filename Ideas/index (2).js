import express from 'express';
import axios from 'axios';
import { getApp } from '../generator/index.js';

const deploymentRouter = express.Router();

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const RAILWAY_TOKEN = process.env.RAILWAY_TOKEN;

// ─── POST /vercel ──────────────────────────────────────────────────────────────
deploymentRouter.post('/vercel', async (req, res) => {
  try {
    if (!VERCEL_TOKEN) {
      return res.status(503).json({ error: 'Vercel no configurado' });
    }

    const app = await getApp(req.body.appName);
    if (!app) return res.status(404).json({ error: 'App no encontrada' });

    const fs = await import('fs');
    const path = await import('path');
    const frontendDir = path.resolve(process.cwd(), 'apps', app.name, 'frontend');

    if (!fs.existsSync(frontendDir)) {
      return res.status(404).json({ error: 'Frontend no encontrado' });
    }

    // Read all frontend files and create Vercel file objects
    const files = [];
    const fileNames = fs.readdirSync(frontendDir);
    for (const fileName of fileNames) {
      const filePath = path.resolve(frontendDir, fileName);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) continue;
      const content = fs.readFileSync(filePath, 'utf-8');
      files.push({
        file: fileName,
        content,
        encoding: 'utf-8'
      });
    }

    const response = await axios.post('https://api.vercel.com/v13/deployments', {
      name: `geo-${app.name}`,
      files,
      projectSettings: {
        framework: null
      }
    }, {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    return res.json({ url: response.data.url, id: response.data.id });
  } catch (err) {
    console.error('[Deployment] Vercel deployment error:', err.message);
    return res.status(500).json({ error: err.response?.data?.message || err.message });
  }
});

// ─── POST /railway ─────────────────────────────────────────────────────────────
deploymentRouter.post('/railway', async (req, res) => {
  try {
    if (!RAILWAY_TOKEN) {
      return res.status(503).json({ error: 'Railway no configurado' });
    }

    const app = await getApp(req.body.appName);
    if (!app) return res.status(404).json({ error: 'App no encontrada' });

    const fs = await import('fs');
    const path = await import('path');
    const appDir = path.resolve(process.cwd(), 'apps', app.name);

    if (!fs.existsSync(appDir)) {
      return res.status(404).json({ error: 'Directorio de app no encontrado' });
    }

    // Read all app files for Railway deployment
    const files = [];
    function readDirRecursive(dir, base = '') {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.resolve(dir, entry.name);
        const relPath = base ? `${base}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules' || entry.name === '.git') continue;
          readDirRecursive(fullPath, relPath);
        } else {
          const content = fs.readFileSync(fullPath, 'utf-8');
          files.push({
            file: relPath,
            content,
            encoding: 'utf-8'
          });
        }
      }
    }
    readDirRecursive(appDir);

    // Create a Railway project and deploy
    const projectResponse = await axios.post('https://backboard.railway.app/graphql/v2', {
      query: `mutation { projectCreate(input: { name: "geo-${app.name}" }) { project { id } } }`
    }, {
      headers: {
        Authorization: `Bearer ${RAILWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const projectId = projectResponse.data?.data?.projectCreate?.project?.id;

    if (!projectId) {
      return res.status(500).json({ error: 'No se pudo crear el proyecto en Railway' });
    }

    // Create a service within the project
    const serviceResponse = await axios.post('https://backboard.railway.app/graphql/v2', {
      query: `mutation($projectId: String!, $serviceName: String!) { serviceCreate(input: { projectId: $projectId, name: $serviceName }) { service { id } } }`,
      variables: {
        projectId,
        serviceName: `geo-${app.name}`
      }
    }, {
      headers: {
        Authorization: `Bearer ${RAILWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const serviceId = serviceResponse.data?.data?.serviceCreate?.service?.id;

    if (!serviceId) {
      return res.status(500).json({ error: 'No se pudo crear el servicio en Railway' });
    }

    // Deploy by uploaing via the Railway API
    // Use the deployment trigger mechanism
    const deployResponse = await axios.post('https://backboard.railway.app/graphql/v2', {
      query: `mutation($serviceId: String!) { deploymentTrigger(input: { serviceId: $serviceId }) { deployment { id status } } }`,
      variables: { serviceId }
    }, {
      headers: {
        Authorization: `Bearer ${RAILWAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    const deployment = deployResponse.data?.data?.deploymentTrigger?.deployment;

    return res.json({
      url: `https://geo-${app.name}.up.railway.app`,
      id: deployment?.id || projectId,
      projectId,
      serviceId
    });
  } catch (err) {
    console.error('[Deployment] Railway deployment error:', err.message);
    return res.status(500).json({ error: err.response?.data?.message || err.message });
  }
});

// ─── GET /status/:appName ──────────────────────────────────────────────────────
deploymentRouter.get('/status/:appName', async (req, res) => {
  try {
    const { appName } = req.params;
    const app = await getApp(appName);
    if (!app) return res.status(404).json({ error: 'App no encontrada' });

    const status = {
      vercel: { deployed: false, url: null },
      railway: { deployed: false, url: null }
    };

    // Check Vercel deployment status
    if (VERCEL_TOKEN) {
      try {
        const vercelResponse = await axios.get(
          `https://api.vercel.com/v13/deployments?name=geo-${appName}&limit=1`,
          {
            headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
            timeout: 15000
          }
        );
        const deployments = vercelResponse.data?.deployments || [];
        if (deployments.length > 0) {
          const latest = deployments[0];
          status.vercel = {
            deployed: latest.state === 'READY',
            url: latest.url ? `https://${latest.url}` : null,
            state: latest.state
          };
        }
      } catch (err) {
        console.error('[Deployment] Vercel status check error:', err.message);
        status.vercel = { deployed: false, url: null, error: 'Error consultando Vercel' };
      }
    } else {
      status.vercel = { deployed: false, url: null, error: 'Vercel no configurado' };
    }

    // Check Railway deployment status
    if (RAILWAY_TOKEN) {
      try {
        const railwayResponse = await axios.post('https://backboard.railway.app/graphql/v2', {
          query: `query { projects { id name deployments { id status url } } }`
        }, {
          headers: { Authorization: `Bearer ${RAILWAY_TOKEN}` },
          timeout: 15000
        });
        const projects = railwayResponse.data?.data?.projects || [];
        const matchingProject = projects.find(p => p.name === `geo-${appName}`);
        if (matchingProject && matchingProject.deployments?.length > 0) {
          const latest = matchingProject.deployments[0];
          status.railway = {
            deployed: latest.status === 'SUCCESS',
            url: latest.url || `https://geo-${appName}.up.railway.app`,
            state: latest.status
          };
        }
      } catch (err) {
        console.error('[Deployment] Railway status check error:', err.message);
        status.railway = { deployed: false, url: null, error: 'Error consultando Railway' };
      }
    } else {
      status.railway = { deployed: false, url: null, error: 'Railway no configurado' };
    }

    return res.json(status);
  } catch (err) {
    console.error('[Deployment] Status check error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

export { deploymentRouter };
