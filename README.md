# **SIT323/SIT737 - Cloud Native Application Development - Task -10.1P: Monitoring and Visibility of NodeJS Application**

## End-to-End Deployment and Monitoring of a Containerised Node.js Application on GCP using Kubernetes and MongoDB Atlas

## Student Name: Inwang Ubong Marshal
## Student ID: 222093271


## Overview

This documentation outlines the complete process undertaken for Task 10.1P of the SIT737 unit, which involves building, containerising, deploying, and monitoring a Node.js-based registration application on the Google Cloud Platform (GCP). The key objective of this task was to gain practical experience in deploying a microservice-based cloud-native application and applying observability principles through GCP’s native monitoring tools.

The solution was developed using several core technologies. The backend of the application was built with Node.js and connected to a **MongoDB Atlas** database hosted on the cloud. The application was containerised using **Docker** and deployed to a Kubernetes cluster created on **GCP Kubernetes Engine**. Continuous observability and real-time insights were enabled using **Google Cloud Operations Suite (Stackdriver)**. For source control and version management, **GitHub** was integrated with the GCP Cloud Shell environment, allowing seamless collaboration and direct code pushes to the main branch.

Monitoring plays a critical role in ensuring the stability and performance of cloud-native applications. By using Stackdriver, we captured metrics such as CPU usage, memory consumption, container restarts, and log severity levels. This observability allows for proactive performance tuning and rapid troubleshooting in production environments.


*Figure: GCP Project Dashboard showing Kubernetes Engine cluster setup.*
![alt text](./Screenshots/GCP-Dashboard.png)
![alt text](./Screenshots/KubernetesEnginecluster.jpg)


This report will systematically document the technical setup, deployment process, monitoring configuration, encountered challenges, and solutions implemented throughout the task.


## Project Initialisation & Setup 

This section outlines the setup of essential services and tools used to prepare the containerised Node.js application for deployment. Every choice—from database to version control—was made with scalability, cloud compatibility, and DevOps alignment in mind.


### MongoDB Atlas: Cloud Database Setup

**Tool Used**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

**Justification:** MongoDB Atlas offers a fully managed NoSQL cloud database, ideal for fast development, global scaling, and integration with containerised apps.

**Steps & Configuration**:

*	Created MongoDB Atlas account and a new project named ClusterApp123.
*	Provisioned a free shared M0 cluster hosted on AWS, region ap-southeast-1, optimised for low latency.
*	Created a database user:
    * Username: `ubongmarshalinwang`
    * Password: `password123xyz`
*	Whitelisted IP address: 0.0.0.0/0 to allow development access from any IP.
*	Generated and tested the connection URI:
```
mongodb+srv://ubongmarshalinwang:password123xyz@clusterapp123.mongodb.net/registrationdb?retryWrites=true&w=majority
```
*	Verified using MongoDB Compass for GUI-based inspection and MongoDB Shell for command-line interaction.
	


*Figure: Shows successful database connection and project setup in MongoDB Atlas.*
![alt text](./Screenshots/MongoDBAtlasClusterSetup.png)



### Google Cloud Platform: Cloud Environment Setup

**Tool Used**: [GCP Console + Cloud Shell](https://console.cloud.google.com/)

**Justification**: GCP supports seamless Kubernetes integration and provides native observability tools (Stackdriver) essential for real-time application monitoring.

**Steps & Configuration**:
*	Logged into GCP Console, created **project** `graphite-buffer-459807-j3`.
*	Enabled required APIs:
    * **Kubernetes Engine API** – for cluster deployment
    * **Compute Engine API** – for managing nodes
    * **Artifact Registry API** – for storing Docker images
*	Activated Cloud Shell to use the pre-configured GCP terminal environment (Docker, Git, gcloud).
*	Configured project:
```
gcloud config set project graphite-buffer-459807-j3
```
![alt text](./Screenshots/GcloudAuthLogin.jpg)


### GitHub: Version Control & Remote Repository

**Tool Used**: [GitHub](https://github.com/)

**Justification**: GitHub acts as the central repository to manage version control, collaborate across tools like Docker and GCP, and automate CI/CD workflows.

**Steps**:
*	Created GitHub repo: `SIT737-2025-PRAC10P`
*	Configured Git user identity in Cloud Shell:
```
git config --global user.name "ubongmarshalinwang"
git config --global user.email "s222092371@deakin.edu.au"
```
*	Linked GitHub remote origin:
```
git remote add origin https://github.com/222093271/SIT737-2025-PRAC10P.git
```


*Figure: GitHub version control in sync with local development environment.*
![alt text](./Screenshots/GitHubSetup.jpg)



## Backend Development & Containerisation

This section details the complete process of building the backend application in Node.js, setting up environment variables for secure configuration, designing a schema using Mongoose for MongoDB, and finally containerising the application with Docker to prepare it for Kubernetes deployment. 
Containerisation plays a critical role in cloud-native deployments, allowing the application and its environment to be packaged and run consistently across different platforms. In this section, the Node.js application is Dockerised, tagged, tested locally, and pushed to Docker Hub to prepare for deployment on Google Kubernetes Engine (GKE).

### Project Structure Setup

**Tool**: Visual Studio Code (VS Code)

**Directory Structure**:

```
.
├── node_modules/
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .env
├── .gitignore
├── application.js
├── docker-compose.yaml
├── Dockerfile
├── k8s-deployment.yaml
├── mongo-secret.yaml
├── package.json
├── package-lock.json
├── README-cloudshell.txt
```

**Justification**:
Organising files into public/ allows for clean separation of concerns—frontend assets and backend logic.


*Figure: Shows structured Node.js app ready for development.*
![alt text](./Screenshots/VSCodeStructure.png)


### Frontend: Basic Registration Form

**File**: `public/index.html`

Developed a minimal form with fields for Name, Email, Password, and Phone Number.

**Script (script.js)**:

* Captures form data using JavaScript

* Sends a `POST` request to the `/registration` endpoint


*Figure: Simple form to collect user data from clients.*
![alt text](./Screenshots/FrontendUI.jpg)


### Backend: Express Server & MongoDB Integration

**Main File**: `application.js`

* Used Express.js to create the web server
* Connected MongoDB using Mongoose
* Handled `/registration` route to accept and store user data

```
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

// Pull in the single connection URI from env
const { MONGO_URI, PORT = 3000 } = process.env;

const DB_TYPE = process.env.DB_TYPE;            // "mongodb"
const MONGODB_URI = process.env.MONGO_URI;      // Atlas URI
const MONGO_DB_NAME = process.env.MONGO_DB_NAME; // "registrationdb"


if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment");
  process.exit(1);
}

// Connect to MongoDB Atlas via the full URI
mongoose
  .connect(MONGODB_URI, {
    dbName: MONGO_DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(`✅ Connected to ${DB_TYPE}://${MONGO_DB_NAME}`))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Define the User schema & model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
});
const User = mongoose.model("User", userSchema);

// Create Express app
const app = express();

// Serve static files from `public/` (your frontend)
app.use(express.static(path.join(__dirname, "public")));

// Parse JSON bodies
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).send('Backend is running');
  });
  
// Registration endpoint
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = new User({ name, email, password, phone });
    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      console.error("❌ Registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

```

*Figure: Successful Express server start.*
![alt text](./Screenshots/SuccessfulExpressServerStart.jpg)


### Environment Configuration

**File**: *.env*

```
MONGO_URI=mongodb+srv://ubongmarshalinwang:password123xyz@clusterapp123.w4xev4o.mongodb.net/registrationdb?retryWrites=true&w=majority&appName=ClusterApp123
PORT=3000
MONGO_DB_NAME=registrationdb
```

**Justification**:

Environment variables keep credentials secure and separate from codebase, supporting best DevOps practices.


**⚠️ Note**: `.env` file should be excluded in `.gitignore` to prevent secret leakage.


### MongoDB Schema with Mongoose

**File**: *application.js* - User Schema

```
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
});
const User = mongoose.model("User", userSchema);
```

*Figure: MongoDB collection successfully receives user data.*
![alt text](./Screenshots/MongoDBDatabase.png)


### Dockerise the Application

We began by installing Docker Desktop on the local machine to containerise the Node.js registration application. Docker provides a lightweight virtualised environment that includes all the necessary code, dependencies, runtime, and libraries for the app to run anywhere.

The `Dockerfile` is a declarative blueprint for creating the Docker image. It ensures the application runs with Node.js 18 and includes all dependencies.

**File**: Dockerfile

```
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "application.js"]
```

* `FROM node:24-alpine`: Pulls Node.js version 24-alpine base image from Docker Hub.

* `WORKDIR /app`: Sets working directory inside the container.

* `COPY package*.json ./`: Adds only the package metadata first to leverage Docker cache.

* `RUN npm install`: Installs project dependencies.

* `COPY . .`: Copies all other project files into the image.

* `EXPOSE 3000`: Declares that the app listens on port 3000.

* `CMD`: Launches the server.


After verifying functionality, the image was pushed to Docker Hub to make it accessible from GCP:

```
docker build -t simple-node-app .
docker tag simple-node-app 222093271/simple-node-app
docker push 222093271/simple-node-app
```
*Figure: Docker Image Build and Push to Docker Hub Commands*
![alt text](./Screenshots/DockerImageBuild.jpg)
![alt text](./Screenshots/DockerImagePush.jpg)

Once uploaded to Docker Hub, the image was referenced in the Kubernetes deployment file (k8s-deployment.yaml) using:

```
image: 222093271/simple-node-app
```

This reference allows Kubernetes on GCP to fetch the image and launch pods with consistent environments.

**Justification**:

In summary, Dockerising the Node.js application created a portable, reliable unit of execution. It enabled testing in local environments and seamless handoff to cloud orchestration platforms like Kubernetes. Pushing the image to Docker Hub ensured universal accessibility and integration into GCP workflows.


*Figure: Docker image pushed to Docker Hub for deployment on Kubernetes.*
![alt text](./Screenshots/DockerHubImage.jpg)


## Kubernetes Deployment and Configuration

This section outlines the process of deploying the containerised `Node.js` application on **Google Kubernetes Engine (GKE)**, configuring environment secrets, and exposing the service externally. Kubernetes ensures scalability, reliability, and automated management of containerised workloads.

Kubernetes (K8s) plays a critical role in orchestrating containerised workloads. It manages scaling, deployment, load balancing, health monitoring, and fault tolerance for cloud-native applications. In this section, we detail the step-by-step deployment of the Dockerised Node.js registration app to **Google Kubernetes Engine (GKE)**.


### Creating the Kubernetes Cluster on GCP

Before deployment, a Kubernetes cluster must be created using GCP Cloud Shell. A cost-effective configuration was chosen using a micro instance and standard disk to stay within quota.

We began by setting up a Kubernetes cluster using GCP Cloud Shell. Since this was a student environment with limited quotas, we intentionally selected cost-effective configurations using:

* Region: `australia-southeast1`

* Machine type: `e2-micro`

* Disk type: `pd-standard`

* Disk size: `10 GB`


```
gcloud container clusters create simple-node-cluster \
  --num-nodes=1 \
  --region=australia-southeast1 \
  --machine-type=e2-micro \
  --disk-type=pd-standard \
  --disk-size=10
```
This created a minimal but functional cluster for development and testing.

*Figure: GKE cluster created with default-pool for micro-node instance.*
![alt text](./Screenshots/GKEClusterCreation.png)
![alt text](./Screenshots/GKEClusterCreationSuccess.png)


### Preparing the Kubernetes Secret

Rather than hardcoding the MongoDB URI in our application code, we followed best practices by storing it in a Kubernetes Secret. This ensures credentials are not exposed in logs or Docker images. 

To keep the MongoDB Atlas URI secure, it was stored in a Kubernetes Secret.

**File**: `mongo-secret.yaml`

```
apiVersion: v1
kind: Secret
metadata:
  name: mongodb-uri-secret
type: Opaque
stringData:
  MONGO_URI: "mongodb+srv://ubongmarshalinwang:password123xyz@clusterapp123.w4xev4o.mongodb.net/registrationdb?retryWrites=true&w=majority&appName=ClusterApp123"
```
Command to apply:
```  
kubectl apply -f mongo-secret.yaml
```

This allows the deployment to inject the URI securely as an environment variable.

*Figure: MongoDB URI safely injected as Kubernetes Secret.*
![alt text](./Screenshots/MongoDBURISecretKubernetes.png)


### Creating the Deployment and Service

**File**: `k8s-deployment.yaml`

We then defined the deployment and service manifest to:

* Deploy a pod using the Docker image 222093271/simple-node-app

* Inject environment variables from secrets

* Configure health probes (liveness/readiness)

* Expose service to the internet via LoadBalancer

Key Sections of Deployment File:

* `replicas: 1`: Single instance for demo purposes

* `imagePullPolicy: Always`: Ensures latest version of the image is pulled

* `env`: Securely pulls MongoDB URI and other variables

* `livenessProbe, readinessProbe`: Ensure app is healthy and responsive


```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: simple-node-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: simple-node-app
  template:
    metadata:
      labels:
        app: simple-node-app
    spec:
      containers:
        - name: simple-node-app
          image: 222093271/simple-node-app 
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
          env:
            - name: DB_TYPE
              value: "mongodb"
            - name: MONGO_URI
              valueFrom:
                secretKeyRef:
                  name: mongodb-uri-secret
                  key: MONGO_URI
            - name: MONGO_DB_NAME
              value: "registrationdb"
            - name: DEBUG
              value: "false"
          # <-- Health checks start here -->
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 20
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: simple-node-app
spec:
  type: LoadBalancer
  selector:
    app: simple-node-app
  ports:
    - port: 80
      targetPort: 3000
```

Commands: 
```
kubectl expose deployment simple-node-app --type=LoadBalancer --port=80 --target-port=3000
kubectl apply -f k8s-deployment.yaml
kubectl get pods
kubectl get service

```
Once deployed, the application was available externally using the LoadBalancer's external IP (e.g., http://34.151.X.X).

*Figure: Service type LoadBalancer exposes app to the web.*
![alt text](./Screenshots/ServiceExposedwithExIP.jpg)
![alt text](./Screenshots/SuccessfulExposetotheWeb.jpg)

### Enable APIs and Services

To ensure seamless interaction between Kubernetes, monitoring tools, and connected services, several Google Cloud APIs were activated. Key among them were:

 * Cloud Monitoring API (431,987 requests)

 * Compute Engine API (105,064 requests)

 * Cloud Logging API

 * Kubernetes Engine API

These APIs enabled deployment tracking, log capturing, and performance monitoring. Monitoring showed 0% errors for core services like Kubernetes and Logging, ensuring stable operations.

![alt text](./Screenshots/EnablingAPIsAndServices.jpg)
*Caption: Screenshot showing API request count, latency, and error rates*

This activation was critical for Stackdriver dashboards, container insights, and backend connectivity between GKE and Cloud Shell environments.

### Why Kubernetes?

Kubernetes automates:

* **Deployment & Scaling**: One YAML change can scale pods.

* **Load Balancing**: Evenly distributes traffic to available pods.

* **Fault Tolerance**: Automatically replaces crashed containers.

* **Environment Injection**: Securely handles secrets and configs.

This makes it ideal for modern, production-ready, and resilient microservice architectures.


## Monitoring with GCP Operations Suite (Stackdriver)

Monitoring is the cornerstone of a reliable cloud-native application. After deploying the containerised Node.js application on GKE, Google Cloud Operations Suite (formerly Stackdriver) was used to implement robust observability features. This helped track CPU usage, memory, logs, and container behavior in real-time.

### Why Monitoring Matters

In any containerised microservices setup, observability becomes crucial for the following reasons:

* **Health Checks**: Detect unresponsive services.

* **Resource Usage**: Track CPU, memory, and disk to prevent over-utilisation.

* **Error Analysis**: View logs to debug application failures.

* **Scalability Planning**: Make decisions on horizontal or vertical scaling.

* **Cost Efficiency**: Avoid unnecessary over-provisioning.

Google Cloud’s Monitoring suite integrates seamlessly with GKE, making it ideal for this task.

### Enabling Google Cloud Monitoring

Once the GKE cluster was successfully created and workloads deployed, Cloud Monitoring was automatically enabled for the project under GCP’s default observability scope.

**Navigation**:

* Go to Google Cloud Console
* Navigate to Monitoring > Metrics Explorer
* Choose Kubernetes Container as resource

### Setting Up Google Cloud Monitoring Dashboard

To begin monitoring:

* Navigated to Monitoring > Dashboards > Create Dashboard

* Added widgets like:

    * VM Instance CPU Utilization

    * Kubernetes Container Log Entries

    * CPU & Memory Utilization for containers

    * Container Restart Metrics

**Purpose**: These widgets helped us observe the live behavior of the deployed application, diagnose spikes, and validate pod stability.

![alt text](./Screenshots/CustomMonitoringDashboard.jpg)
*Caption: Shows how Stackdriver captures real-time VM, container, and log metrics from GKE deployment.*

### Observing Kubernetes Engine (GKE) Metrics

The following metrics were configured and monitored:

Kubernetes Cluster Metrics
* **CPU Request % Used**

    Ensures container CPU requests align with real usage. High usage indicates scaling is needed.


![alt text](./Screenshots/CPUUsagePercent.png)
*Caption: CPU request percentage highlighting usage spikes over time.*


* **Memory Request % Used**

    Validates that memory allocations are optimized for each container.

![alt text](./Screenshots/MemoryRequestUsed.png)
*Caption: Memory trends per container across monitored intervals.*

* Container Restarts / Min
    Frequent restarts suggest application crashes or lack of resource provisioning.

![alt text](./Screenshots/ContainerRestartCount.png)
*Caption: Monitored container instability based on restart frequency.*

![alt text](./Screenshots/GKEClusters.jpg)
*Caption: GKE: Observed Clusters*

**Compute Engine VM Metrics**

While GKE abstracts nodes, it's still important to monitor the underlying virtual machines.

* **CPU Utilization (Top 5 VMs)**
    Showcases how VM-level resource usage correlates with container workloads.

* **Disk and Memory Utilisation**
    Note: Metrics were not collected without the Ops Agent, a lesson learned during deployment.

![alt text](./Screenshots/ComputeEngineMetrics.jpg)
*Caption: GCP Compute Engine metrics showing CPU usage for VM instances.*


### Custom Dashboards and Widgets

To improve visibility:

* Custom dashboards were created using Add Widget functionality.

* Charts included:

    * VM CPU Utilisation [MEAN]

    * Kubernetes Container CPU/Memory Utilisation [MEAN]

    * Log Entry Types (INFO, WARNING, ERROR)

![alttext](./Screenshots/MonitoringDashboardGCP.jpg)
*Caption: A customized GCP dashboard with rich visual widgets for different resource metrics.*

### GKE Logs Analysis via Log Explorer

Logs are central for debugging. We used the Logs Explorer to:

* View real-time container logs

* Filter logs based on severity (INFO, WARNING, ERROR)

* Track spikes in logs during pod restarts or failed HTTP probes

![alt text](./Screenshots/LogsMetrics.jpg)
*Caption: Shows log traffic separated by type to pinpoint issues.*

### Logs Dashboard Summary
This dashboard consolidates all cluster, container, and compute engine logs in one panel.

* GKE Cluster Logs by Severity: Count of default logs at each timestamp.

* GKE Container Errors: Breakdown of issues across event exporters and system collectors.

* Compute Engine Logs by Severity: Debug and notice logs for VM-level analysis.

*🛠️ Insight: This helped correlate pod crashes with specific error types logged.*

![alt text](./Screenshots/GCPLogsDashboard.jpg)
*Caption: Provides a comprehensive time-based breakdown of system and container logs.*

### Observations and Insights

Based on the collected data:

* There were occasional spikes in CPU and container restarts, prompting review of app health checks.

* The memory usage was generally stable, affirming the e2-micro configuration for lightweight services.

* Disk usage and Ops Agent setup remained a gap (documented under limitations).

![alt text](./Screenshots/CPUusageacrossZones.jpg)
*Caption: Heatmap and treemap showcasing high-level VM CPU usage across zones.*


### Lessons Learned

* **Install Ops Agent Early**: VM-level metrics like memory and disk are unavailable without it.

* **Liveness & Readiness Probes Help**: Their proper configuration reduces restarts.

* **Combine Logs + Metrics**: Logs gave deeper context behind spikes seen in charts.

### Summary of Monitoring Benefits

* **Real-time Alerting**: Alerts were configured to notify on abnormal CPU usage or container crashes.

* **Auto-Healing Pods**: Stackdriver worked in sync with Kubernetes health checks to recreate failed pods.

* **Visualisation**: Bar graphs, pie charts, and heatmaps made metrics intuitive.

* **Troubleshooting**: Error logs allowed root cause analysis and quick fixes.

This monitoring setup ensured that the **simple-node-app** was not just deployed but continuously observable, promoting proactive rather than reactive operations. All insights gathered here directly influenced system tuning and Kubernetes configuration, leading to a more stable deployment lifecycle.


## CI/CD – GitHub Deployment and Version Control 

Version control is a cornerstone of modern DevOps workflows, and for this project, GitHub was used as the source control platform to manage the entire project lifecycle—from development to deployment and version tracking. The workflow was integrated directly with Google Cloud Shell, enabling seamless code editing, versioning, and direct pushes to GitHub.

### Setting Up Remote Repository

The process began by initializing a Git repository and creating a direct remote connection with the GitHub repository using the following commands:

```
git init
git branch -M main
git remote add origin https://github.com/222093271/SIT737-2025-PRAC10P.git
```

A critical step was the configuration of a `.gitignore` file to exclude unnecessary and oversized files from being tracked. It included:

```
node_modules/
.cache/
*.log
*.json
```

![alt text](./Screenshots/GitIgnoreFile.png)
*Caption: .gitignore file*

This prevented the addition of debug logs, cache directories, cloud CLI binaries, and large local MongoDB files that could trigger GitHub size limits.


### Git Issues Encountered

Several obstacles were encountered during the initial push:

* Push Rejected (Secret Detected):
GitHub's Push Protection flagged a **Google OAuth token** found in `.kube/gke_gcloud_auth_plugin_cache`.

Fix:

```
git stash --include-untracked
git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch .kube/gke_gcloud_auth_plugin_cache" \
--prune-empty --tag-name-filter cat -- --all
```

Large File Size Rejection:

* Files like verylarge.json (462 MB) exceeded GitHub's 100 MB limit.
* Fix: File was removed, .gitignore was applied, and the repository was cleaned with:

```
git rm -r --cached .
git add .
git commit -m "Cleaned repo after removing large files"
```

### GitHub Push Not Reflecting in Repo – Root Cause and Resolution

Initially, GitHub pushes from Cloud Shell failed silently, and commits weren't appearing in the GitHub repository.

**Fix: GitHub Repository Authentication via GCP**

The issue was resolved by navigating to **Google Cloud > Developer Connect > Git Repositories**, and linking the GitHub repository using verified credentials:

* GitHub Username

* GitHub PAT (Personal Access Token)

![alt text](./Screenshots/GcloudGitRepoLink.jpg)
*Caption: GitHub repository successfully linked in GCP*

This allowed Git to authenticate correctly and enabled full source control integration.

### Final Push and Confirmation

Once cleaned, the final successful push was executed using:

```
git config --global credential.helper cache
git push -u origin main --force

```
![alt text](./Screenshots/GcloudtoGitHubRepo.jpg)
*Caption: Terminal confirmation of successful push.*

![alt text](./Screenshots/GitHubPRojectStructure.jpg)
*Caption: GitHub repository view confirming project structure on main branch.*

This final push integrated the app code, Kubernetes manifests, Dockerfiles, and monitoring configs into version control, enabling full CI/CD traceability.



## Challenges Faced and Resolutions

Throughout the deployment of the containerised Node.js application on **Google Cloud Platform (GCP)**, several technical and configuration-related challenges were encountered. These issues ranged from environment configuration to security and version control limitations. This section outlines each major hurdle and the actions taken to overcome them.


### 1. Secret Detected in Git Commit (Google OAuth Token)

**Problem**:
GitHub rejected a commit push due to the presence of a Google OAuth access token in the .kube/gke_gcloud_auth_plugin_cache file.

**Cause**:
This sensitive token was automatically cached while authenticating to GCP through gcloud auth login, and was unknowingly included in the Git commit.

**Resolution**:
The secret-containing file was filtered out using the following sequence:

```
git stash --include-untracked
git filter-branch --force --index-filter \
"git rm --cached --ignore-unmatch .kube/gke_gcloud_auth_plugin_cache" \
--prune-empty --tag-name-filter cat -- --all
```


### 2. File Size Limit Exceeded (Over 100MB)

**Problem**:
The file verylarge.json (462MB) inside node_modules/mongoimport/test exceeded GitHub’s 100MB file limit and triggered a push rejection.

**Cause**:
Some large development files were unintentionally tracked and committed due to initial absence of a proper .gitignore.

**Resolution**:

* Created .gitignore to exclude unnecessary files and folders.

* Removed large files using:
```
git rm --cached <filename>
```

* Reset Git index and recommitted:

```
git rm -r --cached .
git add .
git commit -m "Cleaned up project: Initial Push to GitHub main branch"
```

### 3. Docker Image Push Re-authentication

**Problem**:
Docker image push failed due to invalid credentials.

**Resolution**:
The user re-logged into Docker using:

```
docker login
```
Credentials were accepted, allowing the image to be pushed to Docker Hub:

```
docker push 222093271/simple-node-app
```

### 4. Kubernetes Cluster Deployment Errors

**Problem**:
Deployment initially failed due to region quota and resource exhaustion.

**Resolution**:
Modified the cluster creation command to use:

* `e2-micro` machine type

* `pd-standard` disk

* `--disk-size=10` to stay under quota

```
gcloud container clusters create simple-node-cluster \
--num-nodes=1 --region=australia-southeast1 \
--machine-type=e2-micro --disk-type=pd-standard --disk-size=10
```

By identifying these challenges early and iteratively applying solutions, the deployment process remained on track. These real-world debugging and problem-solving experiences enriched the overall learning outcome of the project.


## Final Testing and Evaluation

### Application Functionality Check

After successful deployment, the containerised Node.js registration application was exposed through a LoadBalancer IP (e.g., 34.151.124.156). The application frontend was tested to ensure the entire backend-frontend pipeline worked as expected.

* **Test Performed**: A new user filled the registration form.

* **Result**: Registration completed successfully, showing the prompt:

![alt text](./Screenshots/SuccessFormSubmit.jpg)
*Figure: Confirmation alert for successful user registration.*

This verified:

* MongoDB Atlas database connection using secrets from Kubernetes.

* API route /register functioning properly.

* Frontend-to-backend integration over public IP.


### Duplicate Entry Validation

To test data integrity and prevent redundant entries, the registration form was submitted again with the same email.

* **System Behaviour**: The application responded with a rejection.

![alt text](./Screenshots/FrontendErrorinFormSubmission.jpg)
*Figure: Email duplication check in real-time – ensures uniqueness.*

This confirms:

* Proper database query checks implemented in backend logic.

* Validation middleware and response alerts are correctly configured.


### Load Testing & Scaling Decision

After consistent monitoring via Stackdriver and dashboard alerts, resource spikes were noticed on the Kubernetes cluster.

Action Taken:

We resized the cluster by scaling down to 0 nodes for cost efficiency using:
```
gcloud container clusters resize simple-node-cluster \
  --node-pool default-pool --num-nodes 0 --region=australia-southeast1
```

Rescaled back to 1 node when testing resumed:

```
gcloud container clusters resize simple-node-cluster \
  --node-pool default-pool --num-nodes 1 --region=australia-southeast1
```

![alt text](./Screenshots/GCPShellCostOptimised.jpg)
*Figure: GKE cluster dynamically resized – cost optimisation measure.*


This validated:

* Cluster resizing worked instantly using GCP CLI.

* Nodes in the default-pool dynamically handled lifecycle changes.

* No data was lost, and the service remained intact after re-scaling.

![alt text](./Screenshots/CostOptimisedinGcloud.png)
*Figure: Cost Optimisation Visualisation*

All backend, frontend, and monitoring systems operated flawlessly post-deployment. The app confirmed database persistence, frontend accuracy, duplicate checks, and live accessibility.


## Conclusion and Recommendations 

This Task 10.1P project successfully demonstrated the end-to-end deployment, configuration, and monitoring of a containerised Node.js registration application on Google Kubernetes Engine (GKE) using MongoDB Atlas, Docker, and GitHub. Through strategic planning and execution, we implemented a scalable microservice architecture integrated with Google Cloud's Operations Suite (Stackdriver) for real-time insights, performance tracking, and troubleshooting.

The project highlighted the significance of cloud-native deployments by emphasising automation, container orchestration, and resource optimisation. Using secrets management for MongoDB credentials, secure push practices via GitHub, and Stackdriver for proactive monitoring created a robust and secure deployment environment.

Despite several challenges—such as oversized files, secret leak detections, push rejections, and quota issues—we applied effective resolutions like `.gitignore` rules, GitHub credential linking, and dynamic cluster scaling via `gcloud` commands.

### Recommendations:

* **Enable Auto-Scaling**: Future deployments should implement Kubernetes Horizontal Pod Autoscaler for dynamic traffic handling.

* **Use GitHub Actions for CI/CD**: Automating the build–test–deploy pipeline would streamline future iterations.

* **Secret Manager Integration**: Moving secrets to GCP Secret Manager adds centralised security and scalability.

* **Monitoring Alert Policies**: Setting custom alert thresholds would ensure early detection of anomalies.

Overall, this task reinforced the importance of DevOps best practices in modern cloud application management.
