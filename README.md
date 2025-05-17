# **SIT323/SIT737 - Cloud Native Application Development - Task -10.1P: Monitoring and Visibility of NodeJS Application**

## End-to-End Deployment and Monitoring of a Containerized Node.js Application on GCP using Kubernetes and MongoDB Atlas

## Student Name: Inwang Ubong Marshal
## Student ID: 222093271


## Overview

This documentation outlines the complete process undertaken for Task 10.1P of the SIT737 unit, which involves building, containerizing, deploying, and monitoring a Node.js-based registration application on the Google Cloud Platform (GCP). The key objective of this task was to gain practical experience in deploying a microservice-based cloud-native application and applying observability principles through GCP’s native monitoring tools.

The solution was developed using several core technologies. The backend of the application was built with Node.js and connected to a MongoDB Atlas database hosted on the cloud. The application was containerised using Docker and deployed to a Kubernetes cluster created on GCP Kubernetes Engine. Continuous observability and real-time insights were enabled using Google Cloud Operations Suite (Stackdriver). For source control and version management, GitHub was integrated with the GCP Cloud Shell environment, allowing seamless collaboration and direct code pushes to the main branch.

Monitoring plays a critical role in ensuring the stability and performance of cloud-native applications. By using Stackdriver, we captured metrics such as CPU usage, memory consumption, container restarts, and log severity levels. This observability allows for proactive performance tuning and rapid troubleshooting in production environments.

📸 (Insert image here: Screenshot of project overview in Google Cloud Console with Kubernetes cluster listed)
Figure 1: GCP Project Dashboard showing Kubernetes Engine cluster setup.
![image](https://github.com/user-attachments/assets/ccb677a3-a022-4c37-9589-147af3768c04)


This report will systematically document the technical setup, deployment process, monitoring configuration, encountered challenges, and solutions implemented throughout the task.


## Project Initialization & Setup 

This section outlines the setup of essential services and tools used to prepare the containerized Node.js application for deployment. Every choice—from database to version control—was made with scalability, cloud compatibility, and DevOps alignment in mind.

### MongoDB Atlas: Cloud Database Setup

**Tool Used**: MongoDB Atlas

**Justification:** MongoDB Atlas offers a fully managed NoSQL cloud database, ideal for fast development, global scaling, and integration with containerized apps.

**Steps & Configuration**:

*	Created MongoDB Atlas account and a new project named ClusterApp123.
*	Provisioned a free shared M0 cluster hosted on AWS, region ap-southeast-1, optimized for low latency.
*	Created a database user:
    * Username: `ubongmarshalinwang`
    * Password: `password123xyz`
*	Whitelisted IP address: 0.0.0.0/0 to allow development access from any IP.
*	Generated and tested the connection URI:
```
mongodb+srv://ubongmarshalinwang:password123xyz@clusterapp123.mongodb.net/registrationdb?retryWrites=true&w=majority
```
*	Verified using MongoDB Compass for GUI-based inspection and MongoDB Shell for command-line interaction.
*	
📸 (Insert image here: MongoDB Atlas cluster dashboard)
Figure: Shows successful database connection and project setup in MongoDB Atlas.


### Google Cloud Platform: Cloud Environment Setup

**Tool Used**: GCP Console + Cloud Shell

**Justification**: GCP supports seamless Kubernetes integration and provides native observability tools (Stackdriver) essential for real-time application monitoring.

**Steps & Configuration**:
*	Logged into GCP Console, created project graphite-buffer-459807-j3.
*	Enabled required APIs:
    * Kubernetes Engine API – for cluster deployment
    * Compute Engine API – for managing nodes
    * Artifact Registry API – for storing Docker images
*	Activated Cloud Shell to use the pre-configured GCP terminal environment (Docker, Git, gcloud).
*	Configured project:
```
gcloud config set project graphite-buffer-459807-j3
```


### GitHub: Version Control & Remote Repository

**Tool Used**: GitHub

**Justification**: GitHub acts as the central repository to manage version control, collaborate across tools like Docker and GCP, and automate CI/CD workflows.

**Steps**:
*	Created GitHub repo: SIT737-2025-PRAC10P
*	Configured Git user identity in Cloud Shell:
```
git config --global user.name "ubongmarshalinwang"
git config --global user.email "s222092371@deakin.edu.au"
```
*	Linked GitHub remote origin:
```
git remote add origin https://github.com/222093271/SIT737-2025-PRAC10P.git
```

📸 (Insert image here: GitHub repository with linked commits and README.md)
Figure: GitHub version control in sync with local development environment.

