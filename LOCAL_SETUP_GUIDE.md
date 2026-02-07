# Product Jarvis - Local Setup Guide

This guide will walk you through setting up Product Jarvis on your computer. No technical experience required.

**Time Required:** About 5-10 minutes with Claude Code, or 15-20 minutes manual setup

---

## Before You Start: Install Required Software

Product Jarvis requires **Node.js** and **Python** to run. Choose your setup method:

### Option A: Use Claude Code (Recommended)

If you have Claude Code installed, it can handle the prerequisites for you:

1. Open Claude Code
2. Tell it: *"I need to set up Product Jarvis. Please install Node.js and Python if I don't have them, then help me set up the project."*
3. Claude Code will check what's installed and guide you through any missing pieces
4. Skip to **Step 1: Download and Unzip Product Jarvis** below

---

### Option B: Manual Installation

If you don't have Claude Code or prefer to install manually:

**Install Node.js:**
- Go to **https://nodejs.org/** and download the **LTS** version
- Run the installer and follow the prompts
- Official guide: https://nodejs.org/en/learn/getting-started/how-to-install-nodejs

**Install Python:**
- Go to **https://www.python.org/downloads/** and download the latest version
- Run the installer
- **Windows users:** Make sure to check **"Add python.exe to PATH"** during installation
- Official guide: https://wiki.python.org/moin/BeginnersGuide/Download

**Verify Installation:**
Open a terminal (Mac: Terminal app, Windows: Command Prompt) and run:
```
node --version
python3 --version   # Mac
python --version    # Windows
```
You should see version numbers (e.g., `v20.10.0` and `Python 3.12.1`).

---

## Step 1: Download and Unzip Product Jarvis

1. Download the Product Jarvis zip file (you should have received this via email or file share)
2. Find the downloaded file in your **Downloads** folder
3. Unzip the file:
   - **Mac:** Double-click the zip file. A folder called `product-jarvis` will appear.
   - **Windows:** Right-click the zip file → click **"Extract All..."** → click **"Extract"**
4. Move the `product-jarvis` folder somewhere easy to find, like your **Documents** folder

> **[SCREENSHOT PLACEHOLDER: product-jarvis folder contents showing backend and frontend folders]**

---

## Step 2: Open Two Terminal Windows

You will need **two terminal windows** open for the entire time you use Product Jarvis:
- **Terminal 1: Backend** - runs the "brain" of the application
- **Terminal 2: Frontend** - runs the visual interface

### Open Terminal 1: Backend

**On Mac:**
1. Press `Command + Space` to open Spotlight
2. Type **Terminal** and press Enter
3. A window will open with a command prompt

**On Windows:**
1. Press the Windows key
2. Type **Command Prompt**
3. Click **Command Prompt** to open it

**Rename this window** (so you don't get confused):
- On the title bar, you can mentally note this is "Terminal 1: Backend"
- Or keep a sticky note nearby

### Open Terminal 2: Frontend

Open a second terminal window using the same steps above.

**On Mac:** In Terminal, press `Command + N` to open a new window

**On Windows:** Open Command Prompt again from the Start menu

You should now have **two terminal windows** open side by side.

> **[SCREENSHOT PLACEHOLDER: Two terminal windows open side by side, labeled Terminal 1: Backend and Terminal 2: Frontend]**

---

## Step 3: Set Up Terminal 1: Backend

All commands in this section go in **Terminal 1: Backend**.

### 3a. Navigate to the project folder

Type `cd ` (the letters "cd" followed by a space), then **drag and drop** the `product-jarvis` folder from your file browser into the terminal window. This automatically types the folder path for you.

Press **Enter**.

**What you typed should look something like:**
```
cd /Users/yourname/Documents/product-jarvis
```
(on Mac)

```
cd C:\Users\yourname\Documents\product-jarvis
```
(on Windows)

### 3b. Go into the backend folder

Type this command and press **Enter**:
```
cd backend
```

### 3c. Create a virtual environment

This creates a special folder to store the backend's requirements.

**On Mac**, type this and press **Enter**:
```
python3 -m venv venv
```

**On Windows**, type this and press **Enter**:
```
python -m venv venv
```

Wait a few seconds for it to complete. You won't see any message - it just returns to the prompt.

### 3d. Activate the virtual environment

This tells the terminal to use the special folder you just created.

**On Mac**, type this and press **Enter**:
```
source venv/bin/activate
```

**On Windows (Command Prompt)**, type this and press **Enter**:
```
venv\Scripts\activate
```

**How to know it worked:** You should see `(venv)` appear at the beginning of your command line. This means the virtual environment is active.

### 3e. Install the backend requirements

Type this command and press **Enter**:
```
pip install -r requirements.txt
```

**Wait for this to complete.** It will download and install several packages. You'll see a lot of text scrolling by. This can take 1-2 minutes.

When it's done, you'll see the command prompt again.

### 3f. Configure the AI Assistant (Optional)

The AI Assistant feature requires an API key from Anthropic. Skip this step if you don't need the AI features.

1. **Get an API key:**
   - Go to: **https://console.anthropic.com/settings/keys**
   - Create an account or sign in
   - Click **"Create Key"**
   - Copy the key (it starts with `sk-ant-`)

2. **Create the configuration file:**

   **On Mac**, type:
   ```
   cp .env.example .env
   ```

   **On Windows**, type:
   ```
   copy .env.example .env
   ```

3. **Edit the .env file:**
   - Open the `backend` folder in your file browser
   - Find the file named `.env` (not `.env.example`)
   - Open it with any text editor (Notepad on Windows, TextEdit on Mac)
   - Replace `your-api-key-here` with your actual API key
   - Save and close the file

### 3g. Start the backend server

Type this command and press **Enter**:
```
uvicorn main:app --reload --port 8000
```

**How to know it worked:** You should see text that includes:
```
Uvicorn running on http://127.0.0.1:8000
```

**IMPORTANT:** Leave Terminal 1: Backend open and running. Do not close it or press any keys. The backend must stay running.

> **[SCREENSHOT PLACEHOLDER: Terminal showing Uvicorn running successfully]**

---

## Step 4: Set Up Terminal 2: Frontend

All commands in this section go in **Terminal 2: Frontend**.

### 4a. Navigate to the project folder

Same as before - type `cd ` then drag and drop the `product-jarvis` folder into the terminal. Press **Enter**.

### 4b. Go into the frontend folder

Type this command and press **Enter**:
```
cd frontend
```

### 4c. Install the frontend requirements

Type this command and press **Enter**:
```
npm install
```

**Wait for this to complete.** This downloads the visual interface components. It can take 2-3 minutes. You'll see a lot of text scrolling by.

When it's done, you'll see the command prompt again.

### 4d. Start the frontend server

Type this command and press **Enter**:
```
npm run dev
```

**How to know it worked:** You should see text that includes:
```
Local: http://localhost:5173/
```

**IMPORTANT:** Leave Terminal 2: Frontend open and running. Do not close it.

> **[SCREENSHOT PLACEHOLDER: Terminal showing npm run dev output with localhost URL]**

---

## Step 5: Open Product Jarvis in Your Browser

1. Open your web browser (Chrome, Safari, Firefox, or Edge all work)
2. In the address bar, type: **http://localhost:5173**
3. Press **Enter**
4. You should see the Product Jarvis dashboard!

> **[SCREENSHOT PLACEHOLDER: Product Jarvis dashboard in browser]**

---

## You're All Set!

Product Jarvis is now running on your computer.

**Next Steps:**
1. In the app, go to **Tools → User Guides**
2. Select the guide for your role:
   - **Department Head Guide** - if you create and value products
   - **Project Manager Guide** - if you enrich products and manage services
   - **Leadership Guide** - if you make build/backlog/kill decisions

---

## Stopping Product Jarvis

When you're done for the day:

1. Go to **Terminal 2: Frontend** and press `Ctrl + C` (hold Control and press C)
2. Go to **Terminal 1: Backend** and press `Ctrl + C`
3. Close both terminal windows

---

## Starting Product Jarvis Again (After First-Time Setup)

Once you've completed the setup above, starting again is much faster.

### Terminal 1: Backend

1. Open a terminal window
2. Navigate to the project: `cd /path/to/product-jarvis/backend` (or drag-drop the folder)
3. Activate the virtual environment:
   - **Mac:** `source venv/bin/activate`
   - **Windows:** `venv\Scripts\activate`
4. Start the server: `uvicorn main:app --reload --port 8000`

### Terminal 2: Frontend

1. Open another terminal window
2. Navigate to the project: `cd /path/to/product-jarvis/frontend` (or drag-drop the folder)
3. Start the server: `npm run dev`

### Open the Browser

Go to **http://localhost:5173**

---

## Troubleshooting

### "command not found: python" or "python is not recognized"
**Problem:** Python is not installed or not added to PATH.
**Solution:** Reinstall Python. On Windows, make sure to check **"Add python.exe to PATH"** during installation. Restart your computer after installing.

### "command not found: npm" or "npm is not recognized"
**Problem:** Node.js is not installed properly.
**Solution:** Reinstall Node.js from https://nodejs.org/. Restart your computer after installing.

### "(venv) doesn't appear" after running the activate command
**Problem:** The virtual environment wasn't created or activation failed.
**Solution:** Make sure you're in the `backend` folder, then try creating the environment again:
- Mac: `python3 -m venv venv`
- Windows: `python -m venv venv`

### "Port 8000 is already in use"
**Problem:** Another application is using that port.
**Solution:** Use a different port: `uvicorn main:app --reload --port 8001`

### "ModuleNotFoundError" when starting the backend
**Problem:** The required packages aren't installed.
**Solution:** Make sure `(venv)` appears in your prompt, then run: `pip install -r requirements.txt`

### Frontend shows "Cannot connect to server" or similar
**Problem:** The backend isn't running.
**Solution:** Check Terminal 1: Backend. Make sure it shows "Uvicorn running on http://127.0.0.1:8000". If not, restart it.

### AI Assistant says "No API key configured"
**Problem:** The API key isn't set up.
**Solution:**
1. Make sure you created `.env` (not just `.env.example`)
2. Make sure the key in `.env` starts with `sk-ant-`
3. Restart the backend (Ctrl+C, then run the uvicorn command again)

### Windows PowerShell: "Execution policy" error
**Problem:** PowerShell is blocking scripts.
**Solution:** Use Command Prompt instead of PowerShell, or:
1. Right-click PowerShell and select "Run as Administrator"
2. Type: `Set-ExecutionPolicy RemoteSigned`
3. Press Enter and type `Y` to confirm
4. Close and reopen PowerShell

---

## Need Help?

If you encounter issues not covered here, contact your IT support or the project administrator.
