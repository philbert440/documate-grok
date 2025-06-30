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
I enjoyed implementing GitHub Actions workflows for pull requests (PRs), enabling developers to add a label to deploy the full stack to a shared development EKS cluster. The workflow built only the components affected by changes in the monorepo, using the latest from the main branch for the rest. This allowed each PR to be tested independently before approval and merging. Another workflow then tested the merged changes against production configuration and sanitized production data. I also automated the release process, enabling the team to perform multiple weekly production releases. This improved release cadence and reduced the time from feature request or bug identification to solution delivery by approximately 40 times.

## Shipcode: Developer Tooling Overhaul
Nx Monorepo tooling

## Shipcode: The Host System
We used Istio service mesh and knative.

## Shipcode: Real Time Collaboration
I led the Shipcode engineering team, collaborating with the Design and Sales teams to define requirements for a microservice managing user cursor position, user selection, and simultaneous multi-user change merging. I worked with engineers to prioritize delivery and deployment, ensuring efficient implementation.

## Shipcode: from 0-1
There is a lot to add here, Domain Driven Design, CQRS Architecture, Event Drive Microservices, Angular, Nest, Next, Azure, AWS, GCP, CosmoDB, Postgres, Nest, Next, WebRTC, we were moving quickly and able to rip out anything that didn't serve us and put in its place somethings that did.

## Branding Brand: Flagship Integrations
I was originally brought on as a Senior Engineering Manager to lead the team building integrations with external services for Flagship the then product focus of Branding Brand. Within the first 6 months of being hired I witnessed the collapse of the R&D team and took a hard look at the product I was pitched when initially hired and realized that the vast majority of it was demoware/vaporware and not architecturally sound, the product manager and a few of the key engineers quit which led to a realization of the need for a complete rewrite from first principals and build it right from the start for maintability and flexability. I pulled in 3 of the top engineers in the company and we began the process of building shipcode from the ground up, to have a product that actually delivers on the vision that the CEO and CTO had laid out but failed to deliver.

## Adapify: Home Test Pro
Adapifies expansion into water and air quality testing.

## Adapify: RxSoil Algorithm to AI
Recommendations Algorithm was rewritten for generative AI responses.

## Adapify: Laboratory SaaS
Laboratory D2C SaaS

## Adapify: Adapify Sports


## Adapify: We Evolve Us
Local Social Network for crowdfunding and collaboration to make communitues great

## Microsoft: Sands Casino Hack Response
FBI, Treasury, Homeland Security, and a small handful of Microsofts top Security people.

## Microsoft: Nokia Acquisition
Led the migration effort for that parts of Nokia that Microsoft didn't buy and MSIT came in and absorbed what's left.

## Microsoft: Adobe Email Down
I was called it to quickly migrate Adobe to the cloud after their on-prem email servers failed and caused their corporate email to be down for multiple days.

## Microsoft: Netflix in 2013
Worked with Netflix IT team through setup, configuration, and deployment of Office 365, AzureAD, and ADFS.

## Microsoft: 3M azure cloud storage and OneDrive
Worked with key stakeholder to plan, prep, and migrate 3M's data to Azure Cloud Storage and OneDrive.

## Microsoft: Nielsen 50,000 person Cloud Migration
Scripted the migration of a 50,000 user organization from on-prem to cloud infrastructure seemlessly.

## Pheon Technologies Group
In 2009, I saw a Microsoft Research video of a touch screen table with infinite points of contact. After seeing that and deciding that I needed one in my apartment. I found NUI(Natural User Interface) group and open source project made up of a couple hundred other like minded individuals around the work attempting to build somethings similar. Community Core Vision was the software to enable multi touch devices using FTIR (Frustrated Total Internal Reflection). This was acheived by placing infrared led strips around the edges of an enlightened acrylic panel, to flood the panel with light. Whenever anything came in contact with the surface that would reflect to the other side where there was a modified PS3 eye cam with an infrared filter to visually pick up the blobs of light being reflected, then Community Core Vision would translate those light blobs into touch input. I also helped with organizing a group buy for a manufacturing run of enlightened acrylic panels for building the devices.

At the time I dismantled my HDTV to pull the LCD matrix out of it, fun fact: LCD doesn't block infrared light so it's kind of the perfect solution to putting image/screen just under the panel that is recognizing the user input from the surface and with a little bit of software and calibration the whole thing works seamlessly. 