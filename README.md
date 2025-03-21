# **Facebook Access Token Checker & Auto Message Sender**  

This is a **Node.js-based application** that performs **Facebook access token verification** and **automated message sending** on Messenger.  

## **🚀 Features**  

### **🔹 Access Token Verification**  
- Users can **input their Facebook access token** through a simple form.  
- The backend checks the token's **validity** using the **Facebook Graph API**.  
- If valid, it displays **user details** (Name, ID & Profile URL); if invalid or expired, an **error message** is shown.  

### **🔹 Automated Facebook Message Sender**  
- Uses **Facebook Graph API** to send **automated messages** on Messenger.  
- Supports **continuous message sending** with a custom **speed delay**.  
- Implements **rate limit handling** to avoid API restrictions.  

### **🔹 Built With**  
- **Node.js & Express.js** - For handling backend requests.  
- **EJS** - For rendering dynamic web pages.  
- **Axios** - For making API calls to Facebook.  
- **CSS** - For styling the frontend.  
- **Font Awesome Library** - For displaying the icons.  

## **📌 How to Use**  

### **1️⃣ Start the Server**  
- Clone this repo and Run this command:
```sh
node app.js
```

### **2️⃣ Open the Web Interface & Check Token**  
- Go to **http://localhost:3000/**  and see the interface.
- Enter your **Facebook access token** to check its validity.  

### **3️⃣ Send Automated Messages**  
- Enter **access token, conversation ID** and Choose **message file**.  
- Set the **delay time** for sending messages.  
- Click **Start Server** to begin sending messages automatically.  

## **🛠️ Deployment**  

This project is deployed on **Render.com**.
✅ Visit **https://fbtokencheckerbysameersiins.onrender.com/** to see the project.

<br><br>

#### **💻 Created by Altamash Siddiqui**  