// Este código es para un entorno Node.js, usado por las funciones de Netlify.
// Necesitarás instalar 'node-fetch'.
const fetch = require('node-fetch');

// El handler es la función principal que Netlify ejecutará.
exports.handler = async function(event) {
    // Solo permitimos peticiones de tipo POST para más seguridad.
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Extraemos el 'prompt' que nos envía el frontend.
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: 'Error: El prompt es requerido.' };
        }

        // Aquí está la magia: accedemos a la API key de forma segura.
        // Netlify inyecta esta variable desde la configuración de tu sitio.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return { statusCode: 500, body: 'Error: La API Key no está configurada en el servidor.' };
        }
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        };

        // Hacemos la llamada real a la API de Google desde el servidor.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Error desde la API de Google:', errorBody);
            return { statusCode: response.status, body: `Error desde la API de Google: ${errorBody}` };
        }

        const result = await response.json();
        
        // Devolvemos solo el texto generado al frontend.
        const text = result.candidates[0].content.parts[0].text;
        return {
            statusCode: 200,
            body: JSON.stringify({ text: text })
        };

    } catch (error) {
        console.error('Error en la función de Netlify:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno del servidor.' })
        };
    }
};
