# Research and Plan for Your Personal Homepage

## 1. Project Goal

To create a personalized, self-hosted homepage that acts as a central dashboard for your digital life. This dashboard will aggregate data from various services you use, providing a single, at-a-glance view of your activities, goals, and interests.

## 2. Inspiration and Core Concepts

The project is inspired by your existing Obsidian setup, with a focus on:

*   **Modularity and Customization:** The ability to add, remove, and arrange different widgets or modules.
*   **Markdown Support:** Using Markdown for notes and journaling, similar to Obsidian.
*   **Easy Linking:** Seamlessly linking between different sections and notes.
-   **Minimalist UI:** A clean and uncluttered interface that is easy to navigate.

## 3. Proposed Tech Stack

*   **Framework:** Next.js (React) - As requested and a good choice for this type of project.
*   **Styling:** Tailwind CSS - For a utility-first approach to styling, which is great for building custom designs quickly.
*   **Database:** A simple, file-based database like SQLite or even just JSON files for storing configuration and data, to begin with.
*   **Authentication:** NextAuth.js for handling authentication with various services (Garmin, Steam, etc.).

## 4. Feature Breakdown and Implementation Plan

### a. Mood Tracker

*   **Concept:** A year-overview calendar view where each day is colored based on a mood rating. This provides a visual "at-a-glance" summary of your mood over the entire year.
*   **Implementation:**
    *   Create a component that renders a grid representing the days of the year.
    *   Each day in the grid will be a clickable element.
    *   Clicking a day will open a modal or a small form to input a mood rating (e.g., a number from 1-5 or a selection of emojis).
    *   The mood rating will be stored along with the date.
    *   The color of each day on the calendar will be determined by its corresponding mood rating, using a color scale (e.g., red for bad, green for good).
    *   Libraries like `react-calendar-heatmap` or building a custom grid with CSS Grid/Flexbox could work.

### b. Media Tracker

*   **Concept:** A card-based display for media (movies, TV shows, books) you are currently consuming, with each card featuring an image.
*   **Data Storage:** Use Markdown (`.md`) files with frontmatter for each media item. This is ideal for managing metadata and longer-form notes or reviews.
*   **Implementation:**
    *   Create a directory like `/content/media` to store the `.md` files.
    *   Each file's frontmatter will contain the metadata: `title`, `type` (movie, book), `status` (reading, watched), and `imageUrl`.
    *   The body of the Markdown file can be used for personal notes or a full review.
    *   The application will read these files from the filesystem at build time to generate the card display.

### c. Quick Links & Goal Tracker

*   **Concept:** Sections for frequently accessed links and links to your goal-related notes.
*   **Implementation:**
    *   These can be simple lists of links that are configurable through a settings interface.
    *   The links can be stored in a JSON file.

### d. Exercise Tracker (Strava)

*   **Concept:** Display your running progress (speed and distance) from your Strava data.
*   **Strava API:** Strava offers a well-documented API for developers to access activity data.
*   **Implementation:**
    *   You will need to register your application with Strava to get client ID and client secret.
    *   Implement OAuth 2.0 for user authentication and authorization to access their Strava data.
    *   Use the Strava API to fetch activity data, such as runs, including distance, speed, and other metrics.
    *   Display this data in a user-friendly format, potentially with charts or graphs to show progress over time.

### e. Smart Home (Home Assistant)

*   **Concept:** Integrate with your Home Assistant instance to display information or provide controls.
*   **Home Assistant API:** Home Assistant has a well-documented REST API and WebSocket API.
*   **Implementation:**
    *   You will need to generate a Long-Lived Access Token from your Home Assistant user profile.
    *   Use this token to make authenticated requests to your Home Assistant's API.
    *   You can fetch the state of entities (e.g., sensors, lights) and display them on your dashboard.
    *   The WebSocket API can be used for real-time updates.

### f. Gaming Tracker (Steam)

*   **Concept:** Show what you are currently playing on Steam.
*   **Steam API:** The Steam Web API is free and provides access to a wealth of information.
*   **Implementation:**
    *   You will need a Steam API key.
    *   Use the `GetPlayerSummaries` and `GetRecentlyPlayedGames` endpoints to get your current status and recently played games.
    *   You can display the name of the game you are currently playing, or a list of recently played games with their artwork.

### g. Plex Server Status

*   **Concept:** Display the status of your Plex server.
*   **Plex API:** The Plex API is not officially documented for third-party developers, but it is well-understood and used by many projects.
*   **Implementation:**
    *   You will need to get your Plex authentication token.
    *   You can then make requests to your Plex server's API to get information like the server version, currently playing media, and the number of active sessions.
    *   The `/status/sessions` endpoint will be particularly useful.

### h. Tasks

*   **Concept:** A simple task manager to add and track tasks.
*   **Features:**
    *   Ability to add new tasks.
    *   Ability to check off or mark tasks as complete.
    *   Tasks can optionally have a due date and time.
    *   For tasks with a due date, an alert can be configured to be sent a specified amount of time before the due date (e.g., 15 minutes before, 1 hour before).
*   **Implementation:**
    *   Tasks could be stored in a JSON file or a simple database.
    *   The UI will provide a form to add new tasks, including the optional due date/time and alert settings.
    *   A list of tasks will be displayed, with checkboxes to mark them as complete.
    *   A background process or a service like a cron job could be used to handle sending alerts. For a web application, this might involve browser notifications if the user has the page open, or integrating with a service that can send emails or push notifications.

## 5. Next Steps

1.  **Implement the basic layout and styling with Tailwind CSS.**
2.  **Start with the simpler features:** Quick Links, Goal Tracker, and the Feeling Tracker.
3.  **Tackle the API integrations one by one,** starting with the easiest (Steam) and moving to the more complex ones (Home Assistant, Plex, and Garmin).
4.  **Build out the UI for each feature** as you integrate the APIs.
5.  **Set up authentication** using NextAuth.js to securely store API keys and user data.
