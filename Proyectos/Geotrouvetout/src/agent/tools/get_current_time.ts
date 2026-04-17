export const definicionObtenerHora = {
    type: "function",
    function: {
        name: "obtener_hora_actual",
        description: "Obtiene la fecha y hora actual en la ubicación u hora local del servidor. Úsalo cuando el usuario pregunte la hora o fecha actual.",
        parameters: {
            type: "object",
            properties: {},
            required: []
        }
    }
};

export async function ejecutarObtenerHora(): Promise<string> {
    const ahora = new Date();
    return `La fecha y hora actual exacta es: ${ahora.toLocaleString('es-ES')}`;
}
