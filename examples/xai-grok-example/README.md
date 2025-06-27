# xAI Grok Backend Example

This example demonstrates how to use Documate with xAI's Grok-3-mini model.

## Setup

### 1. Deploy the xAI Grok Backend

First, deploy the xAI Grok backend to AirCode:

1. Go to [AirCode](https://aircode.io)
2. Click "Deploy with AirCode" from the [xAI Grok Backend README](../../alternative/xai-grok-backend/README.md)
3. Set the environment variable:
   - `XAI_API_KEY`: Your xAI API key
4. Deploy the functions

### 2. Update Configuration

Update the `documate.json` file with your backend URL:

```json
{
  "root": "docs",
  "include": ["**/*.md"],
  "backend": "https://your-app.us.aircode.run/upload"
}
```

### 3. Upload Content

Upload your documentation content to the backend:

```bash
npx @documate/documate upload
```

### 4. Integrate Frontend

Add the Documate component to your frontend with the ask endpoint:

```jsx
// React
<Documate endpoint="https://your-app.us.aircode.run/ask" />

// Vue
<Documate endpoint="https://your-app.us.aircode.run/ask" />

// Vanilla JS
<button id="ask-ai" data-endpoint="https://your-app.us.aircode.run/ask">Ask AI</button>
```

## Features

- **Grok-3-mini**: Uses xAI's latest Grok-3-mini model for fast, cost-effective responses
- **xAI Embeddings**: Uses xAI's embedding-001 model for semantic search
- **Streaming**: Real-time streaming responses
- **Multilingual**: Excellent support for multiple languages

## Advantages

- **Fast Performance**: Grok-3-mini is optimized for quick responses
- **Cost Effective**: More affordable than larger models
- **High Quality**: Maintains excellent response quality
- **Real-time**: Supports streaming responses

## Troubleshooting

- Ensure your xAI API key is correctly set
- Check that your backend URLs are accessible
- Verify that your content has been uploaded successfully 