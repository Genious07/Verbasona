# Verbasona: Real-Time Conversation Analytics 🗣️

**Note:** This project is a conceptual piece designed to showcase a full-stack skillset and is not currently in a production-ready state. It serves as a demonstration of my abilities in front-end development, back-end API integration, and real-time database management.

Verbasona is a real-time conversation analytics tool that provides insights into your communication patterns. By linking a mobile device for audio capture with a desktop dashboard, Verbasona analyzes your speech to provide metrics on your talk-to-listen ratio, interruption frequency, and the emotional tone of the conversation.

##  Key Features

* **Dual-Device Linking**: Seamlessly connect a mobile device and a desktop browser using a QR code. The mobile device acts as a microphone, while the desktop provides a rich data visualization dashboard.
* **Live Transcription**: See a real-time transcript of the conversation as it happens.
* **AI-Powered Analysis**: Utilizes the Groq API with LLaMA 3 to analyze the transcription and provide:
    * **Talk/Listen Ratio**: A visualization of how much you speak compared to others in the conversation.
    * **Interruption Frequency**: Tracks how many times you interrupt others versus how many times you are interrupted.
    * **Actionable Insights**: Provides concise, AI-generated suggestions to help you improve your communication skills.
* **Real-Time Dashboard**: A dynamic and responsive dashboard built with Next.js and Tailwind CSS to visualize all the analytics in real-time.


##  Tech Stack

* **Frontend**: [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) for components, and [Recharts](https://recharts.org/) for data visualization.
* **Backend**: Next.js API Routes.
* **AI & Machine Learning**: [Groq API](https://groq.com/) with LLaMA 3 for transcription analysis.
* **Real-Time Database**: [Firebase Realtime Database](https://firebase.google.com/docs/database) to sync data between the mobile and desktop clients instantly.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v20 or later)
* npm or yarn

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/your-username/verbasona.git](https://github.com/your-username/verbasona.git)
    cd verbasona
    ```
2.  **Install NPM packages**
    ```sh
    npm install
    ```
3.  **Set up environment variables**

    Create a `.env.local` file in the root of the project and add the following environment variables. You will need to create a Firebase project and a Groq API account to get these keys.

    ```
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_firebase_database_url
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

    # Groq API Key
    GROQ_API_KEY=your_groq_api_key
    ```
4.  **Run the development server**
    ```sh
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Legacy Project Status & Future Improvements

This project was a fantastic learning experience and a great way to explore the integration of real-time data, AI, and a decoupled frontend. While it's not actively maintained, here are some of the things I would do to improve it and take it to the next level:

* **Improve Transcription Accuracy**: Integrate a more robust, streaming-capable speech-to-text service for better real-time transcription.
* **Speaker Diarization**: Implement speaker diarization to more accurately distinguish between "user" and "others" and to support multi-person conversations.
* **Emotional Tone Analysis**: The `emotion-chart.tsx` component was built but not fully integrated. The next step would be to feed audio data to a model that can perform real-time sentiment analysis and display it on the chart.
* **Authentication and User Accounts**: Add user authentication to allow people to save and track their session history over time.
* **WebRTC for Direct Audio Streaming**: Instead of relying on the browser's Speech Recognition API, use WebRTC to stream audio directly from the mobile client to the server for more control and higher quality.

By presenting your project this way, you're not just showing what you've built, but you're also demonstrating your ability to think critically about your work, understand its limitations, and plan for future improvements—all qualities that are highly valued in a software engineer.
