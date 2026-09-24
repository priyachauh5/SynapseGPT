import express from "express";
import Thread from "../models/Thread.js";
import getOpenRouterResponse from "../utils/openrouter.js";

const router = express.Router();

//test
router.post("/test", async(req, res) => {
    try {
        const thread = new Thread({
            threadId: "abc",
            title: "Testing New Thread1"
        });

        const response = await thread.save();
        res.send(response);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to save in DB"});
    }
});

//Get all threads
router.get("/thread", async(req, res) => {
    try {
        const threads = await Thread.find({}).sort({updatedAt: -1});
        //descending order of updatedAt...most recent data on top
        res.json(threads);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch threads"});
    }
});

router.get("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;

    try {
        const thread = await Thread.findOne({threadId});

        if(!thread) {
            res.status(404).json({error: "Thread not found"});
        }

        res.json(thread.messages);
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to fetch chat"});
    }
});

router.delete("/thread/:threadId", async (req, res) => {
    const {threadId} = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({threadId});

        if(!deletedThread) {
            res.status(404).json({error: "Thread not found"});
        }

        res.status(200).json({success : "Thread deleted successfully"});

    } catch(err) {
        console.log(err);
        res.status(500).json({error: "Failed to delete thread"});
    }
});

router.post("/chat", async(req, res) => {
    const {threadId, message, editIndex, messageId} = req.body;

    if(!threadId || !message) {
        return res.status(400).json({error: "missing required fields"});
    }

    try {
        let thread = await Thread.findOne({threadId});

        if(!thread) {
            //create a new thread in Db
            const assistantReply = await getOpenRouterResponse(message);
            thread = new Thread({
                threadId,
                title: message,
                messages: [
                    {role: "user", content: message, timestamp: new Date()},
                    {role: "assistant", content: assistantReply, timestamp: new Date()}
                ]
            });
            await thread.save();

            return res.json({
                reply: assistantReply,
                userMessage: thread.messages[0],
                assistantMessage: thread.messages[1],
                messages: thread.messages
            });
        }

        // If this is an EDIT request on an existing message
        if (editIndex !== undefined && editIndex !== null) {
            let targetIdx = -1;
            if (messageId) {
                targetIdx = thread.messages.findIndex(m => m._id && m._id.toString() === messageId.toString());
            }
            if (targetIdx === -1 && typeof editIndex === "number" && editIndex >= 0 && editIndex < thread.messages.length) {
                targetIdx = editIndex;
            }

            if (targetIdx !== -1 && thread.messages[targetIdx].role === "user") {
                // Update the edited user message
                thread.messages[targetIdx].content = message;
                thread.messages[targetIdx].timestamp = new Date();

                // If editing the very first message, also update the thread title
                if (targetIdx === 0) {
                    thread.title = message;
                }

                // Regenerate the AI response using the edited question
                const assistantReply = await getOpenRouterResponse(message);

                // Replace the old response for that conversation point
                let assistantMsg;
                if (targetIdx + 1 < thread.messages.length && thread.messages[targetIdx + 1].role === "assistant") {
                    thread.messages[targetIdx + 1].content = assistantReply;
                    thread.messages[targetIdx + 1].timestamp = new Date();
                    assistantMsg = thread.messages[targetIdx + 1];
                } else {
                    assistantMsg = { role: "assistant", content: assistantReply, timestamp: new Date() };
                    thread.messages.splice(targetIdx + 1, 0, assistantMsg);
                }

                thread.updatedAt = new Date();
                await thread.save();

                return res.json({
                    reply: assistantReply,
                    userMessage: thread.messages[targetIdx],
                    assistantMessage: assistantMsg,
                    messages: thread.messages,
                    editIndex: targetIdx
                });
            }
        }

        // Normal new message appending flow
        thread.messages.push({role: "user", content: message, timestamp: new Date()});

        const assistantReply = await getOpenRouterResponse(message);

        thread.messages.push({role: "assistant", content: assistantReply, timestamp: new Date()});
        thread.updatedAt = new Date();

        await thread.save();

        const savedUserMsg = thread.messages[thread.messages.length - 2];
        const savedAssistantMsg = thread.messages[thread.messages.length - 1];

        res.json({
            reply: assistantReply,
            userMessage: savedUserMsg,
            assistantMessage: savedAssistantMsg,
            messages: thread.messages
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({error: "something went wrong"});
    }
});


export default router;






// import express from "express";
// import Thread from "../models/Thread.js";
// import getOpenAIAPIResponse from "../utils/openai.js";

// const router = express.Router();

// //test
// router.post("/test", async(req, res) => {
//     try {
//         const thread = new Thread({
//             threadId: "abc",
//             title: "Testing New Thread2"
//         });

//         const response = await thread.save();
//         res.send(response);
//     } catch(err) {
//         console.log(err);
//         res.status(500).json({error: "Failed to save in DB"});
//     }
// });

// //Get all threads
// router.get("/thread", async(req, res) => {
//     try {
//         const threads = await Thread.find({}).sort({updatedAt: -1});
//         //descending order of updatedAt...most recent data on top
//         res.json(threads);
//     } catch(err) {
//         console.log(err);
//         res.status(500).json({error: "Failed to fetch threads"});
//     }
// });

// router.get("/thread/:threadId", async(req, res) => {
//     const {threadId} = req.params;

//     try {
//         const thread = await Thread.findOne({threadId});

//         if(!thread) {
//             res.status(404).json({error: "Thread not found"});
//         }

//         res.json(thread.messages);
//     } catch(err) {
//         console.log(err);
//         res.status(500).json({error: "Failed to fetch chat"});
//     }
// });

// router.delete("/thread/:threadId", async (req, res) => {
//     const {threadId} = req.params;

//     try {
//         const deletedThread = await Thread.findOneAndDelete({threadId});

//         if(!deletedThread) {
//             res.status(404).json({error: "Thread not found"});
//         }

//         res.status(200).json({success : "Thread deleted successfully"});

//     } catch(err) {
//         console.log(err);
//         res.status(500).json({error: "Failed to delete thread"});
//     }
// });

// router.post("/chat", async(req, res) => {
//     const {threadId, message} = req.body;

//     if(!threadId || !message) {
//         res.status(400).json({error: "missing required fields"});
//     }

//     try {
//         let thread = await Thread.findOne({threadId});

//         if(!thread) {
//             //create a new thread in Db
//             thread = new Thread({
//                 threadId,
//                 title: message,
//                 messages: [{role: "user", content: message}]
//             });
//         } else {
//             thread.messages.push({role: "user", content: message});
//         }

//         const assistantReply = await getOpenAIAPIResponse(message);

//         thread.messages.push({role: "assistant", content: assistantReply});
//         thread.updatedAt = new Date();

//         await thread.save();
//         res.json({reply: assistantReply});
//     } catch(err) {
//         console.log(err);
//         res.status(500).json({error: "something went wrong"});
//     }
// });




// export default router;