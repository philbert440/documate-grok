# Documate xAI Grok Backend

This is the xAI Grok backend for Documate, which uses xAI's Grok-3-mini model for chat completions and xAI's embedding model for vector search. You can get a copy and launch your own on [AirCode](https://aircode.io) by clicking the button below.

[![Deploy with AirCode](https://aircode.io/aircode-deploy-button.svg)](https://aircode.io/dashboard?owner=AirCodeLabs&repo=documate&path=alternative%2Fxai-grok-backend&appname=Documate%20backend%20xAI%20Grok)

## Features

- **Grok-3-mini Model**: Uses xAI's latest Grok-3-mini model for chat completions
- **xAI Embeddings**: Uses xAI's embedding-001 model for vector search
- **Streaming Responses**: Real-time streaming of AI responses
- **Vector Search**: Semantic search through your documentation
- **Multi-language Support**: Automatically detects and responds in the user's language

## Setup

### 1. Get xAI API Access

To use this backend, you need:
- An xAI API key from [xAI Platform](https://platform.x.ai)

### 2. Deploy to AirCode

1. Click the "Deploy with AirCode" button above
2. Set up your AirCode account if you haven't already
3. Configure the environment variables (see below)

### 3. Environment Variables

Set the following environment variable in your AirCode app:

- `XAI_API_KEY`: Your xAI API key

<img src="https://aircode-yvo.b-cdn.net/resource/1695293654504-29kykwztv1p.jpg" width="400">

### 4. Deploy

Click the __Deploy__ button located on the top bar. This will deploy the functions and provide you with individual accessible URLs for each function.

## Usage

### Main Endpoints

There are two primary endpoints:

#### `upload.js`
This function handles content upload and embedding generation. Once all files are uploaded, the content is processed to generate a knowledge base using xAI's embedding model.

#### `ask.js`
This function handles question requests. When a user asks a question, it:
1. Creates embeddings for the question using xAI's embedding model
2. Searches the knowledge base for related content
3. Sends the context and question to Grok-3-mini
4. Returns the response as a stream

### API Configuration

The backend uses the following xAI models:
- **Chat Model**: `grok-3-mini` for generating responses
- **Embedding Model**: `embedding-001` for creating vector embeddings

## Integration

After deploying the backend, you can integrate it with any of the supported frontend frameworks:

- **React**: Use `@documate/react`
- **Vue**: Use `@documate/vue`
- **Vanilla JS**: Use `@documate/vanilla`

### Example Configuration

In your `documate.json`:

```json
{
  "root": "docs",
  "include": ["**/*.md"],
  "backend": "https://your-app.us.aircode.run/upload"
}
```

In your frontend component:

```jsx
<Documate endpoint="https://your-app.us.aircode.run/ask" />
```

## Advantages of Grok-3-mini

- **Fast Performance**: Optimized for quick responses
- **Cost Effective**: More affordable than larger models
- **High Quality**: Maintains excellent response quality
- **Real-time**: Supports streaming responses
- **Multilingual**: Excellent support for multiple languages

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure your `XAI_API_KEY` is correct and has the necessary permissions
2. **Rate Limiting**: xAI has rate limits; consider implementing retry logic for production use
3. **Embedding Dimension Mismatch**: The backend expects 1536-dimensional embeddings from xAI's embedding-001 model

### Error Messages

- `Missing environment variable XAI_API_KEY`: Set your xAI API key in AirCode
- `xAI API error`: Check your API key and xAI service status

## Support

For more information and support:
- [xAI API Documentation](https://docs.x.ai)
- [Documate Documentation](https://documate.site)
- [GitHub Issues](https://github.com/AirCodeLabs/documate/issues) 