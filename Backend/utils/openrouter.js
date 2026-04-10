import "dotenv/config";

const getOpenRouterResponse = async (message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": "http://localhost:8080",
            "X-Title": "SynapseGPT"
        },
        body: JSON.stringify({
            model: "openrouter/free",
            messages: [
                {
                    role: "user",
                    content: message
                }
            ]
        })
    };

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", options);
        const data = await response.json();

        console.log(data); // 👈 ADD THIS FOR DEBUG

        return data?.choices?.[0]?.message?.content || "No response from AI";
    } catch (err) {
        console.log(err);
        return "Error fetching response";
    }
};

export default getOpenRouterResponse;