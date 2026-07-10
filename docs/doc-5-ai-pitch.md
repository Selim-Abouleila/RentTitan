# Document 5: AI Landlord Pitch & Gemini Integration

RentTitan includes an AI-powered "Landlord Pitch" generator that crafts a highly professional, personalized introductory message in French for prospective landlords. This feature leverages the **Google Gemini API** (`@google/genai` SDK) to dynamically generate content based on the user's real financial data.

## 1. Architecture Flow

The AI generation process spans across multiple microservices to ensure secure data handling and accurate context generation:

1. **Frontend Request:** The user clicks "Generate Pitch" in the React `Dashboard.jsx`. A `POST` request is sent to the Scoring Service (`/api/v1/ai/generate-pitch`) containing the user's JWT in the Authorization header.
2. **Service-to-Service Communication (JWT Forwarding):** The Scoring Service intercepts the request. Instead of relying on arbitrary scores, it forwards the user's JWT to the **Main Backend** (`GET http://localhost:5000/dossiers`) to fetch the user's actual, verified financial profile (Target Rent, Monthly Income, Employment Status, and Guarantor Details).
3. **Prompt Engineering:** The Scoring Service constructs a highly specific prompt, injecting the real financial numbers into the context. It instructs the AI to write a concise, professional 3-sentence message in French, emphasizing the tenant's reliability based on their actual income and guarantors.
4. **Gemini API Call:** The prompt is sent to Google's `gemini-2.0-flash` model via the `@google/genai` SDK.
5. **Response Delivery:** The generated text is returned to the React frontend and displayed beautifully to the user with a convenient "Copy to Clipboard" button.

## 2. Graceful Offline Fallback (Presentation Safety Net)

To ensure high availability and prevent embarrassing errors during live demonstrations (such as hitting rate limits on free-tier API keys), the system includes a **Graceful Fallback Mechanism**.

If the Gemini API throws an error (e.g., `429 Quota Exceeded` or network timeouts), the Scoring Service automatically catches the exception. 
- It logs the error internally.
- It artificially simulates a 1.5-second processing delay to mimic AI generation.
- It dynamically generates a pre-written, highly professional French template that **still injects the user's real financial data** (income, status, guarantor).
- It returns this fallback payload to the frontend (`isMock: true`), ensuring the user interface remains flawless and functional regardless of upstream API outages.

## 3. Configuration

To enable the live AI features, you must configure the Gemini API key in the unified root `.env` file:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

If the key is missing or invalid, the system will safely default to the offline fallback mode.
