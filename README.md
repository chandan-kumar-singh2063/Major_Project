# E-Pasal (Major Project) 🚀

E-Pasal is a next-generation, AI-powered e-commerce platform that combines traditional online shopping workflows with advanced visual search capabilities. Built with a modular microservices architecture, it allows users to find products not just by typing, but by simply uploading or taking a photo of what they're looking for.

![E-Pasal Banner](./system_architecture.jpg)

## 🌐 Live Demo
You can explore the application here:  
**[E-Pasal Deployed App](https://majorproject-deployment-2hsxl.ondigitalocean.app/)**  
*(Note: Please allow 30-60 seconds for the Hugging Face AI service to wake up if it's the first search of the day.)*

---

## ✨ Key Features
- **Visual Product Search**: Upload or snap a photo of any product to find visually similar items in real-time using a custom-trained Vision Transformer (ViT) model.
- **Unified Shopping Experience**: Clean, modern UI for browsing categories, managing carts, and tracking orders.
- **Secure Authentication**: Integrated with JWT and Google OAuth for seamless social login.
- **Khalti Payment Integration**: Localized digital wallet support for fast and secure transactions in Nepal.
- **Multi-Platform Support**: Responsive React web application and a Flutter mobile app.
- **Seller Dashboard**: Dedicated portal for sellers to manage inventory, view orders, and track sales performance.
- **Dark Mode Support**: Beautifully crafted dark and light modes for a premium user experience.

---

## 🛠️ Technology Stack

### 🟦 Frontend
- **React.js** (Vite, TypeScript)
- **Tailwind CSS** (Styling & Layout)
- **Framer Motion** (Animations)
- **Flutter** (Mobile Application)

### 🟩 Backend / API
- **Django & DRF** (Core business logic, Orders, Products, Cart)
- **FastAPI** (AI Inference Microservice)
- **Neon PostgreSQL** (Serverless Relational Database)
- **Cloudinary** (Media and Image storage CDN)

### 🟨 AI / Machine Learning
- **Vision Transformer (ViT)**: Custom fine-tuned model `nigamyadav72/vit-ecommerce-classifier`.
- **Hugging Face Inference API**: Powers the similarity matching logic.

---

## 🏗️ System Architecture
The system follows a decoupled architecture where heavy machine learning tasks are delegated to a dedicated microservice, ensuring the main application remains fast and responsive.

1. **Client Layer**: React Web & Flutter Mobile apps.
2. **API Layer**: Django Monolith handling business logic and a FastAPI proxy for AI search.
3. **Storage Layer**: Neon (Postgres) for structured data and Cloudinary for media assets.
4. **External Services**: Khalti (Payments), Google (Auth), and Hugging Face (AI).

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or Neon account)
- Cloudinary account

### 2. Backend Setup (Django)
```bash
# Clone the repository
git clone https://github.com/nigamyadav72/E-Pasal.git
cd E-Pasal

# Create and activate virtual environment
python -m venv env
source env/bin/activate  # On Windows use `env\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the Django server
python manage.py runserver
```

### 3. Frontend Setup (React)
```bash
cd mp_frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 4. Environment Variables
Create a `.env.local` file in the root and in `mp_frontend` with the following variables:
- `VITE_API_URL`: Backend API URL
- `VITE_SEARCH_API_URL`: AI Service URL
- `DATABASE_URL`: Postgres connection string
- `CLOUDINARY_CLOUD_NAME`: Cloudinary credentials
- `KHALTI_SECRET_KEY`: Khalti API keys

---

## 📖 How to Use

### 🔍 Searching for Products
1. **Text Search**: Use the search bar for traditional keyword searching.
2. **Image Search**: 
   - Click the **Camera Icon** in the search bar.
   - Choose **Upload Image** (from your gallery) or **Take Photo** (capture from camera).
   - Wait for the AI model to process.
   - View visually similar matches sorted by similarity score.

### 💳 Making a Payment
1. Add items to your **Cart**.
2. Proceed to **Checkout**.
3. Select **Khalti Checkout** as your payment method.
4. Complete the transaction via the Khalti popup or mobile app.
5. You will be redirected to a **Payment Success** page automatically.

### 👤 Profile & Orders
- Track your purchase history in the **My Orders** section.
- Customize your profile and manage delivery addresses.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing
Contributions are welcome! If you have suggestions or find bugs, please feel free to open an issue or submit a pull request.

---
**Developed with ❤️ by Nigam Yadav**
