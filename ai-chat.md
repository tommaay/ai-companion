```
Chat
Given a list of messages comprising a conversation, the model will return a response.

Create chat completion
Input
import Heurist from 'heurist'

const heurist = new Heurist({
  apiKey: process.env['HEURIST_API_KEY'], // This is the default and can be omitted
})

async function main() {
  const response = await heurist.chat.completions.create({
    model: 'mistralai/mixtral-8x7b-instruct',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'What is the capital of France?' },
    ],
  })
}

main()

Response
{
  "id": "chatcmpl-123",
  "content": "Hello there, how may I assist you today?"
  "created": 1677652288,
  "model": "mistralai/mixtral-8x7b-instruct",
  "object": "chat.completion",
  "system_fingerprint": null,
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  },
  "ended": 1677652289
}
Parameters
Type: ChatCompletionCreateParamsNonStreaming
Property	Type	Required	Description
model	ChatCompletionModel	true	ID of the model to use.
messages	Array<ChatCompletionMessageParam>	true	A list of messages comprising the conversation so far.
temperature	number		What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
max_tokens	number		The maximum number of [tokens](/tokenizer) that can be generated in the chat completion.
```
