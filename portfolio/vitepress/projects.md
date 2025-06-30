# Projects  
This will eventually be a comprehensive list of all of the projects I've worked on over the years going back in time as you scroll down.

## Philbot & This Portfolio Site
This was a fun project that I knocked out in a weekend. First I put together a vitepress site and added some details about past projects, experience, and a short bio with some fun stories. What's nice about vitepress is the documentation is all generated from markdown which make it easy to write and also easy for AI to ingest, I used the OpenAI Embeddings API to generate embeddings from the md files which is all stored in a sqlite db and then thats fed in the Grok-3-mini prompt with gaurd rails defined so that it doesn't make up stuff and sticks to what it knows based on the info I proved here.

## Shipcode: Scaling Globally
The first customer onboarded to Shipcode was a fitness fasion brand from Australia that had stores in Australia New Zealand Singapore and the US. We needed to still be able to handle low latency real time collaboration between opposite sides of the world. 

## Shipcode: Documentation & AI
My team at shipcode also leveraged comprehensive documentation to train an AI assistant within Shipcode, enabling it to manipulate data effectively for user interactions. The training process utilized pre-existing, well-structured documentation to empower the AI to modify specific data properties dynamically and extract specific components as needed, delivering tailored responses and functional changes. This approach yielded impressive results, enhancing user experience and enabling them to just talk to an AI assitant in natural language to make changes to their site or app.

## Shipcode: Monitoring, Stability, & Security
I implemented real-time threat detection using Falco to monitor runtime security for containers and hosts in our AWS EKS cluster. Following external penetration testing, I refined Falco rules to reduce false positives and align with our threat model. I performed system hardening, including least privilege principles, network policies, and pod security standards, and documented these steps, mapping them to SOC2 controls (e.g., CC6.1, CC6.6) and PCI DSS requirements (e.g., Requirement 6).

I conducted load testing and configured autoscaling for Knative microservices, enabling scale-to-zero to optimize costs and implementing autoscaling with panic scaling to handle load spikes. Karpenter was used for efficient EKS node scaling. I set up logging, tracing, and monitoring for services and Kafka topics using OpenTelemetry, Prometheus, and SigNoz to provide logs and alerting. Additionally, I migrated microservices from a shared RDS instance to individual Aurora PostgreSQL instances for improved isolation and performance.

## Shipcode: Development, Testing, Deployment, and CI/CD
I had a lot of fun with this one.

## Shipcode: The Host System


## Shipcode: Real Time Collaboration


## Shipcode: The Canvas System


## Shipcode: from 0-1


## Shipcode: Developer Tooling Overhaul
Nx Monorepo tooling

## Shipcode: Flagship Integrations
Realizing the need for a complete rewrite

## Adapify: Home Test Pro


## Adapify: RxSoil Algorithm to AI


## Adapify: Laboratory SaaS


## Adapify: Adapify Sports


## Adapify: We Evolve Us


## Microsoft: Sands Casino Hack Response


## Microsoft: Nokia Acquisition


## Microsoft: Adobe Email Down


## Microsoft: Netflix in 2013


## Microsoft: 3M azure cloud storage and onedrive


## Microsoft: Nielsen 50,000 person Cloud Migration


## Pheon Technologies Group
In 2009, I saw a Microsoft Research video of a touch screen table with infinite points of contact. After seeing that and deciding that I needed one in my apartment. I found NUI(Natural User Interface) group and open source project made up of a couple hundred other like minded individuals around the work attempting to build somethings similar. Community Core Vision was the software to enable multi touch devices using FTIR (Frustrated Total Internal Reflection). This was acheived by placing infrared led strips around the edges of an enlightened acrylic panel, to flood the panel with light. Whenever anything came in contact with the surface that would reflect to the other side where there was a modified PS3 eye cam with an infrared filter to visually pick up the blobs of light being reflected, then Community Core Vision would translate those light blobs into touch input. I also helped with organizing a group buy for a manufacturing run of enlightened acrylic panels for building the devices.

At the time I dismantled my HDTV to pull the LCD matrix out of it, fun fact: LCD doesn't block infrared light so it's kind of the perfect solution to putting image/screen just under the panel that is recognizing the user input from the surface and with a little bit of software and calibration the whole thing works seamlessly. 