# 📋 DevPaste CLI

A powerful command-line interface for DevPaste - share code snippets instantly from your terminal.

## ✨ Features

- 🚀 **Fast & Simple** - Upload code with a single command
- 📎 **Auto-detect Language** - Automatically detects programming language from file extension
- 🔒 **Password Protection** - Secure your pastes with passwords
- 🔥 **Burn After Read** - Self-destructing pastes
- 🔐 **Private Pastes** - Keep your code private
- ⏰ **Expiration Control** - Set custom expiration times
- 📥 **Retrieve Pastes** - Fetch and download pastes by ID
- 📋 **Clipboard Integration** - Automatically copies URLs and content to clipboard
- 💅 **Beautiful Output** - Colorful, user-friendly terminal interface

## 📦 Installation

```bash
npm install -g devpaste-cli
```

Or install locally in your project:

```bash
npm install devpaste-cli
```

## 🔧 Configuration

Set your DevPaste instance URL using environment variables:
### Creating Pastes

#### Upload a file

```bash
devpaste file.js
```

#### Upload from stdin

```bash
cat file.js | devpaste
echo "console.log('hello')" | devpaste
```

#### With options

```bash
# Add a title
devpaste file.js --title "My Cool Script"

# Set expiration time
devpaste file.js --expire 1hour

# Make it private
devpaste file.js --private

# Password protect
devpaste file.js --password mySecret123

# Burn after read
devpaste file.js --burn-after-read

# Combine multiple options
devpaste file.js -t "Secret Code" -p -P myPassword -b -e 1week
```

### Retrieving Pastes

#### Get a paste by ID

```bash
devpaste get abc123xyz
```

#### Get a password-protected paste

```bash
devpaste get abc123xyz --password mySecret123
```

#### Save paste to file

```bash
devpaste get abc123xyz --output downloaded.js
```

#### Get and save password-protected paste

```bash
devpaste get abc123xyz -P myPassword -o code.py
```

## 📖 Commands

### Upload (Default Command)

```bash
devpaste [file] [options]
```

**Arguments:**
- `file` - File to upload (optional, reads from stdin if not provided)

**Options:**
- `-l, --language <lang>` - Programming language (auto-detected if not specified)
- `-t, --title <title>` - Paste title
- `-e, --expire <time>` - Expiration time: `1hour`, `1day`, `1week`, `never` (default: `1day`)
- `-p, --private` - Make paste private
- `-P, --password <password>` - Password protect the paste
- `-b, --burn-after-read` - Burn after reading (paste self-destructs after first view)

### Get

```bash
devpaste get <id> [options]
```

**Arguments:**
- `id` - Paste ID to retrieve

**Options:**
- `-P, --password <password>` - Password for protected paste
- `-o, --output <file>` - Save paste content to file

## 🎨 Supported Languages

DevPaste CLI automatically detects the following languages:

| Extension | Language |
|-----------|----------|
| `.js`, `.jsx` | JavaScript |
| `.ts`, `.tsx` | TypeScript |
| `.py` | Python |
| `.java` | Java |
| `.go` | Go |
| `.rs` | Rust |
| `.json` | JSON |
| `.sql` | SQL |
| `.sh` | Bash |
| `.md` | Markdown |
| `.html` | HTML |
| `.css` | CSS |
| `.cpp` | C++ |
| `.c` | C |
| `.rb` | Ruby |
| `.php` | PHP |

Other file types default to `plaintext`.

## 💡 Examples

### Quick Share

```bash
# Share a script
devpaste script.py

# Share with expiration
devpaste config.json -e 1hour
```

### Secure Sharing

```bash
# Password-protected paste
devpaste secrets.env -P "mySecurePass123"

# Private burn-after-read paste
devpaste api-keys.txt -p -b
```

### Piping & Stdin

```bash
# Share command output
ls -la | devpaste

# Share git diff
git diff | devpaste -l diff -t "My changes"

# Share clipboard content
pbpaste | devpaste
```

### Retrieve & Download

```bash
# View a paste
devpaste get xyz789

# Download to file
devpaste get xyz789 -o downloaded-script.sh

# Access protected paste
devpaste get xyz789 -P "password123" -o secure-file.txt
```

### Advanced Workflows

```bash
# Create private, password-protected, expiring paste
devpaste sensitive-data.json \
  --private \
  --password "secret" \
  --expire 1hour \
  --title "Sensitive Config"

# Share code with team (never expires)
devpaste team-script.js \
  -t "Team Onboarding Script" \
  -e never

# One-time secret sharing
devpaste secret.txt \
  -b \
  -P "shareWithBob" \
  -t "Secret for Bob"
```

## 🎯 Output

### Successful Upload

```
Detected language: javascript
✔ Paste created successfully! 🎉

📋 Paste URL: https://devpaste.com/paste/abc123xyz
✓ Copied to clipboard
🔒 Password protected
🔥 Burn after read enabled
```

### Successful Retrieval

```
✔ Paste retrieved successfully!

📋 Paste Details:
Title: My Cool Script
Language: javascript
Created: 1/20/2026, 2:30:00 PM
Expires: 1/21/2026, 2:30:00 PM

📄 Content:
──────────────────────────────────────────────────
console.log("Hello, DevPaste!");
──────────────────────────────────────────────────

✓ Content copied to clipboard
✓ Saved to output.js
```

## 🐛 Troubleshooting

### Connection Errors

If you see `Cannot connect to DevPaste API`:

1. Check if the backend is running
2. Verify your `DEVPASTE_API_URL` environment variable
3. Test the API endpoint: `curl $DEVPASTE_API_URL/health`

```bash
# Set the correct API URL
export DEVPASTE_API_URL="https://your-api-url.com"
devpaste file.js
```

### Password Issues

If you get `Password required or incorrect`:

```bash
# Make sure you're using the correct password
devpaste get abc123 --password "correctPassword"
```

### Paste Not Found

If you get `Paste not found`:

- The paste may have expired
- The paste ID might be incorrect
- Burn-after-read pastes are deleted after first view

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🔗 Links

- [DevPaste Web App](https://devpaste.com)
- [API Documentation](https://docs.devpaste.com)
- [GitHub Repository](https://github.com/yourusername/devpaste-cli)
- [Report Issues](https://github.com/yourusername/devpaste-cli/issues)

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

Made with ❤️ by the DevPaste team