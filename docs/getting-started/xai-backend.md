# Build the xAI Grok Backend

The xAI Grok backend for Documate uses xAI's Grok-3-mini model for chat completions and xAI's embedding model for vector search. These functions can be deployed to [AirCode](https://aircode.io) by a single click.

## Get a Copy

By clicking the button below, you can get a copy of the xAI Grok backend and launch your own App.

<a href="https://aircode.io/dashboard?owner=AirCodeLabs&repo=documate&branch=main&path=alternative%2Fxai-grok-backend&appname=Documate%20xAI%20Grok" style="display: inline-block" target="_blank">
  <img src="https://aircode.io/aircode-deploy-button.svg" alt="Deploy with AirCode" width="166">
</a>

The functions code is located in the [alternative/xai-grok-backend directory on GitHub](https://github.com/AirCodeLabs/documate/tree/main/alternative/xai-grok-backend).

## Prerequisites

Before deploying, you need to:

1. **Get xAI API Access**: Sign up for xAI API access at [xAI Platform](https://platform.x.ai)
2. **Get API Key**: Obtain your xAI API key from the platform

## Deploy

Once you've created the App, you should set the following environment variable in the __Environments__ tabs:

- `XAI_API_KEY`: Your xAI API key from [xAI Platform](https://platform.x.ai)

![](./_images/backend__set-environments.png)

This key is used to access the xAI API, which is required for content processing and chat completions.

Then click the __Deploy__ button located on the top bar. This action will ship the functions and provide you with individual accessible URLs for each function.

## Main Endpoints

There are two primary endpoints you need to know: `upload` and `ask`.

### `upload.js`

This function handles the content upload. Once all the files have been uploaded, the content is processed to generate a knowledge base specific to your project using xAI's embedding model, which is then stored in the database.

### `ask.js`

This function deals with question requests. When a user poses a question, the frontend sends a request to this endpoint. The function then:

1. Creates embeddings for the question using xAI's embedding model
2. Searches the knowledge base for related content
3. Sends the context and question to Grok-3-mini
4. Returns the response as a stream

## xAI Models Used

- **Chat Model**: `grok-3-mini` - Used for generating responses to user questions
- **Embedding Model**: `embedding-001` - Used for creating vector embeddings of content and questions

## Advantages of Grok-3-mini

- **Fast Performance**: Optimized for quick responses
- **Cost Effective**: More affordable than larger models
- **High Quality**: Maintains excellent response quality
- **Real-time**: Supports streaming responses
- **Multilingual**: Excellent support for multiple languages

## Build the Frontend

After you've deployed the backend and got the request URLs, you can start building the frontend using any of the supported frameworks:

- **React**: Use `@documate/react`
- **Vue**: Use `@documate/vue`
- **Vanilla JS**: Use `@documate/vanilla`

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your `XAI_API_KEY` is correct and has the necessary permissions
2. **Rate Limiting**: xAI has rate limits; consider implementing retry logic for production use

### Error Messages

- `Missing environment variable XAI_API_KEY`: Set your xAI API key in AirCode
- `xAI API error`: Check your API key and xAI service status

## Next Steps

- [Get Started with React](./general-react.md)
- [Get Started with Vue](./general-vue.md)
- [Get Started with Vanilla JS](./vanilla-js.md) 