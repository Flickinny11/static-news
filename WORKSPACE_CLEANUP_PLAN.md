# Workspace Cleanup Plan

## 🗑️ Directories to DELETE:

### Duplicate Directories:
- **`static-news/`** - Old duplicate (keep `static.news/` which is current)
- **`static.news/`** - Actually, DELETE this too (seems to be old structure)
- **`ios-app/`** - Old version (keep `ios-app-new/`)
- **`huggingface-space/`** - Old deployment attempt (keep `hf-space-deploy/`)

### Unused Backend Attempts:
- **`backend/`** - Early attempt at backend structure
- **`business/`** - Unused business logic
- **`core/`** - Old core files
- **`streaming/`** - Old streaming attempt
- **`apps/`** - Duplicate of iOS app

### Old Test Files:
- **`test-video-generation.py`** - Old test
- **`test-hf-connection.html`** - Superseded by test-broadcast.html
- **`check-hf-models.py`** - Old model check
- **`check-stream-status.py`** - Old status check
- **`test_models.py`** - Old model test
- **`generate-hf-ssh-key.sh`** - Already generated
- **`deploy-to-hf-space.sh`** - Old deployment script
- **`deploy-to-hf.sh`** - Duplicate deployment script

### Redundant Scripts in hf-space-deploy/:
- **`app.py`** - Old version (keeping app_final.py)
- **`app_v2.py`** - Old version
- **`app_simple_broadcast.py`** - Test version
- **`app_complete_broadcast.py`** - Old attempt
- **`app_real.py`** - Superseded by app_final.py
- **`real_ai_broadcast.py`** - Old attempt
- **`real_broadcast_system.py`** - Old attempt
- **`simple_broadcast_system.py`** - Test version
- **`requirements_simple.txt`** - Keeping requirements_full.txt
- **`requirements_complete.txt`** - Keeping requirements_full.txt

## ✅ Directories/Files to KEEP:

### Main Website:
- **`/`** (root) - All HTML files (index.html, live.html, etc.)
- **`styles/`** - All CSS files
- **`scripts/`** - All JavaScript files (especially live-stream-connector.js)
- **`assets/`** - Images and media

### Deployment:
- **`hf-space-deploy/`** - But only these files:
  - `app_final.py`
  - `requirements_full.txt` 
  - `character_generation_system.py`
  - `README.md`
  - Deployment guides

### iOS App:
- **`ios-app-new/`** - The updated iOS app

### Documentation:
- **`CLAUDE.md`** - Project documentation
- **`INSTRUCTIONS_FOR_NEW_CLAUDE_CODE.md`** - SSH instructions
- **`CLAUDE_CONTEXT_PACKAGE.json`** - Context preservation
- **`CONVERSATION_MEMORY.md`** - Conversation history
- **`PROJECT_STATE_VECTOR.md`** - State embeddings
- **`README.md`** - Main readme
- All other instruction/documentation files

### Git:
- **`.git/`** - Version control
- **`.gitignore`**

## 🧹 Cleanup Commands:

```bash
# Remove duplicate directories
rm -rf static-news/
rm -rf static.news/
rm -rf ios-app/
rm -rf huggingface-space/
rm -rf backend/
rm -rf business/
rm -rf core/
rm -rf streaming/
rm -rf apps/

# Remove old test files
rm -f test-video-generation.py
rm -f test-hf-connection.html
rm -f check-hf-models.py
rm -f check-stream-status.py
rm -f test_models.py
rm -f generate-hf-ssh-key.sh
rm -f deploy-to-hf-space.sh
rm -f deploy-to-hf.sh
rm -f huggingface-video-setup.py
rm -f requirements-hf-video.txt

# Clean up hf-space-deploy directory
cd hf-space-deploy/
rm -f app.py app_v2.py app_simple_broadcast.py app_complete_broadcast.py
rm -f app_real.py real_ai_broadcast.py real_broadcast_system.py
rm -f simple_broadcast_system.py broadcast_system.py
rm -f requirements_simple.txt requirements_complete.txt requirements.txt
rm -f complete-hf-broadcast-space.py
rm -f *.pyc __pycache__/

# Rename requirements_full.txt to requirements.txt for clarity
mv requirements_full.txt requirements.txt
```

## 📁 Final Structure:

```
/Volumes/Logan T7 Touch/static.news/
├── index.html
├── live.html
├── news.html
├── anchors.html
├── shows.html
├── incidents.html
├── sponsors.html
├── styles/
│   └── [all CSS files]
├── scripts/
│   └── [all JS files including live-stream-connector.js]
├── assets/
│   └── [images and media]
├── ios-app-new/
│   └── [iOS application]
├── hf-space-deploy/
│   ├── app_final.py
│   ├── requirements.txt (renamed from requirements_full.txt)
│   ├── character_generation_system.py
│   └── [deployment documentation]
└── [documentation files]
```

This will clean up ~70% of the files while keeping everything essential!