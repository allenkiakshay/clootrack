# Support Ticket System

This project implements a full-stack Support Ticket System with a Django REST Framework backend, a React frontend, and integrates an LLM for automated ticket classification and priority suggestion. The entire application is containerized using Docker and Docker Compose for easy setup and deployment.

## Features

*   **Ticket Submission:** Users can submit new support tickets with a title and description.
*   **LLM-powered Classification:** When a ticket description is entered, an LLM automatically suggests a category and priority, which users can review and override.
*   **Ticket Listing & Filtering:** View all submitted tickets, filtered by status, category, priority, and searchable by title and description.
*   **Ticket Status Update:** Users can update the status of existing tickets.
*   **Statistics Dashboard:** Displays aggregated metrics such as total tickets, open tickets, average tickets per day, and breakdowns by priority and category.
*   **Containerized Environment:** The entire application runs within Docker containers, ensuring consistency and ease of deployment.

## Technologies Used

**Backend:**
*   **Django:** Web framework for rapid development.
*   **Django REST Framework (DRF):** For building the RESTful API.
*   **PostgreSQL:** Relational database.
*   **boto3:** AWS SDK for Python, used for LLM integration via AWS Bedrock.

**Frontend:**
*   **React:** JavaScript library for building user interfaces.
*   **axios:** Promise-based HTTP client for API requests.

**LLM Integration:**
*   **Anthropic Claude-3 Sonnet:** Large Language Model used for ticket classification.
*   **AWS Bedrock:** Managed service providing access to foundation models.

**Infrastructure:**
*   **Docker:** Containerization platform.
*   **Docker Compose:** For defining and running multi-container Docker applications.

## Setup Instructions

Follow these steps to get the application up and running locally.

### Prerequisites

*   **Docker & Docker Compose:** Ensure you have Docker and Docker Compose installed on your system.
*   **AWS Credentials:** The backend integrates with AWS Bedrock. You will need AWS credentials configured (e.g., via `~/.aws/credentials` or environment variables) for an IAM user with permissions to invoke `bedrock-runtime` models, specifically `anthropic.claude-3-sonnet-20240229-v1:0`.

### Environment Variables

Create a `.env` file in the root directory of the project (where `docker-compose.yml` is located) with the following content:

```env
# AWS Region for Bedrock
AWS_REGION=your-aws-region # e.g., us-east-1, ap-south-1

# You may also need to set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
# if not using local AWS config or IAM roles.
# AWS_ACCESS_KEY_ID=your-access-key
# AWS_SECRET_ACCESS_KEY=your-secret-key
```
**Note:** For local development, it's often easiest to configure your AWS CLI with `aws configure` which will store credentials in `~/.aws/credentials`. Docker containers can then access these by default if mounted correctly or configured via environment variables.

### Build and Run

1.  **Navigate to the project root:**
    ```bash
    cd /path/to/clootrack
    ```
2.  **Build and start the services:**
    This command will build the Docker images for the backend and frontend, set up the PostgreSQL database, run Django migrations, and start all services.
    ```bash
    docker-compose up --build
    ```

3.  **Access the Application:**
    *   **Frontend:** Open your web browser and go to `http://localhost:3000`.
    *   **Backend API:** The API will be available at `http://localhost:8000/api/`.

## LLM Integration Details

*   **LLM Used:** Anthropic Claude-3 Sonnet
*   **Platform:** AWS Bedrock
*   **Justification:** Claude-3 Sonnet was chosen for its advanced natural language understanding and generation capabilities, making it highly effective for classifying diverse support ticket descriptions. AWS Bedrock provides a robust and scalable platform for accessing this model, simplifying API integration and managing the underlying infrastructure.

The backend endpoint `/api/tickets/classify/` uses `boto3` to interact with AWS Bedrock. The prompt is designed to instruct the LLM to classify the description into predefined categories and priorities, returning the output in a structured JSON format for easy parsing.

## Key Design Decisions

### Backend (Django REST Framework)

*   **Data Model:** The `Ticket` model in `assignment/models.py` strictly adheres to the specified fields, types, and constraints, including `CharField` with `TextChoices` for category, priority, and status to ensure data integrity at the database level. `auto_now_add` is used for `created_at`.
*   **API Structure:** `TicketViewSet` provides standard CRUD operations. Custom actions (`@action` decorator) are used for the `stats` and `classify` endpoints to keep related functionality within the `Ticket` context.
*   **Filtering and Searching:** `DjangoFilterBackend` and `SearchFilter` are used to provide flexible query parameters for listing tickets, allowing filtering by status, category, priority, and searching across title and description.
*   **Database-level Aggregation:** The `stats` endpoint (`/api/tickets/stats/`) utilizes Django ORM's `annotate` and `aggregate` functions to perform all statistical calculations directly within the PostgreSQL database, optimizing performance and avoiding Python-level loops.
*   **LLM Integration:** The `classify` endpoint handles the LLM call, constructs a clear prompt, and gracefully manages potential errors by returning `None` for suggestions if the LLM call fails, ensuring the application remains functional.

### Frontend (React)

*   **Component-Based Architecture:** The application is structured into logical, reusable React components (`App`, `Stats`, `TicketForm`, `TicketItem`) to enhance maintainability and scalability.
*   **State Management:** `useState` and `useEffect` hooks are used effectively for managing component-local state and side effects. `App.js` acts as the central hub for fetching and managing global ticket and statistics data, passing it down to child components via props.
*   **User Experience (UX):**
    *   **LLM Suggestion:** The `TicketForm` component triggers the LLM classification on `description` input blur, providing immediate category and priority suggestions to the user.
    *   **Debounced Search:** A debounced search input prevents excessive API calls while the user types, improving responsiveness.
    *   **Real-time Updates:** `refreshData` function ensures that the ticket list and statistics dashboard are automatically updated after actions like ticket creation or status changes, without requiring a full page reload.
    *   **Inline Status Editing:** `TicketItem` allows users to directly change a ticket's status via a clickable badge, providing a smooth interaction.

### Containerization

*   **Docker Compose:** A single `docker-compose up --build` command orchestrates the entire application, including the PostgreSQL database, Django backend, and React frontend, ensuring a consistent and easily reproducible development and deployment environment.

## API Endpoints Summary

*   `GET /api/tickets/`: List all tickets (newest first), supports `?status=`, `?priority=`, `?category=`, `?search=` filters.
*   `POST /api/tickets/`: Create a new ticket.
*   `PATCH /api/tickets/<id>/`: Update a ticket (e.g., change status, override category/priority).
*   `GET /api/tickets/stats/`: Returns aggregated statistics (total, open, avg per day, priority breakdown, category breakdown).
*   `POST /api/tickets/classify/`: Accepts a `description`, returns LLM-suggested `category` and `priority`.
