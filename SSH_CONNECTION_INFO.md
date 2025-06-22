# SSH Connection to HuggingFace Space

## Dev Mode SSH Access

When in Dev Mode, HuggingFace provides SSH access to the Space container.

### Connection Details:
- The SSH connection info should be visible in the HF Space settings when Dev Mode is active
- Look for something like: `ssh user@[space-id].hf.space -p [port]`

### VS Code Remote SSH:
1. Install "Remote - SSH" extension in VS Code
2. Open Command Palette (Cmd/Ctrl + Shift + P)
3. Select "Remote-SSH: Connect to Host..."
4. Enter the SSH connection string from HF Space

### Important Notes:
- Dev Mode must be active
- GPU should be allocated (T4)
- Container has git access for pushing changes
- Working directory: `/home/user/app`

### Once Connected:
- You'll have a new VS Code instance
- Claude will see the HF Space filesystem
- Can directly edit and push changes
- Changes trigger automatic rebuilds

## After SSH Connection:
1. Follow INSTRUCTIONS_FOR_NEW_CLAUDE_CODE.md
2. Use QUICK_DEPLOY_COMMANDS.md for fast deployment
3. Monitor the Space rebuild in HF web interface