import { AIMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq"
import dotenv from "dotenv"
import rl from "readline/promises"

dotenv.config()


const readline = rl.createInterface({
    input : process.stdin ,
    output : process.stdout
})


const model = new ChatGroq({
    model: "openai/gpt-oss-120b",
    apiKey: process.env.GROQ_API_KEY,

})



const messages = [] ;


while(true){


    // For streaming effect ..😉

    const userInput = await readline.question("Enter your input 🐰 : ");


    // Adding memory in AI 

    messages.push({
        role : "user",
        content : userInput
    })


    const stream = await model.stream(messages) ;

    let aiResponse = ""


    
    // const stream = await model.stream([
    //     { 
    //         role : "user",
    //         content:userInput
    //     }
    // ])


    
    for await( const chunks of stream){
        aiResponse += chunks.content
        process.stdout.write(chunks.content)

    }

        messages.push({
            role : "assistant",
            content : aiResponse
        })


        process.stdout.write("\n")



    // For normal response .🤗


    // const userInput = await readline.question("Enter your input ..")

    // const response = await model.invoke(userInput)

    // console.log(response.content);
    
}



// const response = await model.invoke("Hello , What is your name ? ");

// console.log(response.content);
