# AI Log Analyzer

> **Copyright 2025 Roy Kim - Customized Code**
> Licensed under the Apache License, Version 2.0

Production-quality CLI tool for AI-driven log analysis, incident triage, and root cause hypothesis generation.

## Features

### Current (v0.1.0)

- **AI-Powered Analysis**: Leverage OpenAI GPT-4 or Anthropic Claude for intelligent log analysis
- **Root Cause Hypothesis**: Generate 3-5 ranked hypotheses with confidence scores, supporting evidence, and validation steps
- **Multiple Log Sources**: Local files and SSH remote access
- **Flexible Output**: Human-readable text, JSON, or CSV formats
- **Customizable Prompts**: YAML-based prompt configuration system
- **Configuration Management**: CLI flags, YAML config files, environment variables with precedence system
- **Test-Driven**: 90%+ test coverage with pytest (312 passing tests)

### Planned (v0.2.0+)

- **Additional LLM Providers**: OpenRouter, self-hosted Ollama ([see ROADMAP.md](ROADMAP.md))
- **More Log Sources**: systemd journald, TCP stream logs ([see ROADMAP.md](ROADMAP.md))
- **Enhanced Pattern Matching**: Improved confidence scoring with historical patterns

See [ROADMAP.md](ROADMAP.md) for complete development timeline and planned features.

## Quick Start

### Prerequisites

- Python 3.11 or higher
- pip
- make (optional, for convenient commands)

### Installation

**Option 1: Install from source (recommended for development)**

```bash
# Clone repository
cd /path/to/ai-log-analyzer

# Create virtual environment and install in editable mode
python3.11 -m venv venv
source venv/bin/activate
pip install -e .

# This installs the 'log-analyzer' command
```

**Option 2: Quick setup with Makefile**

```bash
make setup
```

**Verify installation**:
```bash
log-analyzer --help
log-analyzer version
```

**Configure environment variables**:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
# At minimum, set OPENAI_API_KEY for the default provider
```

### Basic Usage

```bash
# Activate virtual environment (if not already activated)
source venv/bin/activate

# Analyze a local log file
log-analyzer analyze /var/log/syslog

# Use different LLM provider and output format
log-analyzer analyze --provider anthropic --format json app.log

# Generate 5 hypotheses instead of default 3
log-analyzer analyze --hypotheses 5 error.log

# Save output to file
log-analyzer analyze --output report.json --format json syslog

# Use SSH for remote log analysis (SSH URI format)
log-analyzer analyze ssh://user@host/var/log/nginx/error.log

# Use config file for batch processing
log-analyzer batch --config config.yaml

# Interactive REPL mode
log-analyzer repl

# Show current configuration
log-analyzer config

# Show version
log-analyzer version
```

## Configuration

### Configuration Precedence

The tool follows this precedence (highest to lowest):

1. **CLI flags** (e.g., `--provider openai --model gpt-4`)
2. **Config file** (`--config config.yaml`)
3. **Environment variables** (`.env` file)
4. **Built-in defaults**

### Customizing Prompts

The AI Log Analyzer uses LLM prompts that can be fully customized to fit your use case. Prompts are stored in YAML configuration files and support both system prompts (defining the LLM's role) and user prompts (specific instructions).

#### Quick Start

1. **Copy the example file**:
   ```bash
   cp config/prompts.example.yaml config/prompts.yaml
   ```

2. **Edit `config/prompts.yaml`** to customize prompts for your environment

3. **Run analysis** - the tool automatically loads `config/prompts.yaml`

#### Prompt Configuration Precedence

Prompts follow the same precedence system:

1. **CLI flag**: `--prompt-config /custom/prompts.yaml`
2. **Environment**: `PROMPT_CONFIG_PATH=/custom/prompts.yaml`
3. **Default location**: `config/prompts.yaml` (if exists)
4. **Hardcoded defaults**: Built-in fallback prompts

#### Available Prompts

**System Prompts** (define LLM role and behavior):
- `log_analysis`: Initial log analysis system prompt
- `hypothesis_generation`: Root cause hypothesis generation prompt

**User Prompts** (specific instructions):
- `initial_analysis`: Default analysis instructions
- `followup_query`: REPL follow-up question template (supports `{context}` and `{question}` variables)

#### Customization Examples

**Kubernetes-focused analysis**:
```yaml
prompts:
  system:
    log_analysis:
      content: |
        You are a Kubernetes SRE analyzing pod and container logs.
        Focus on:
        - Pod restart patterns and crash loops
        - Resource limits and OOMKilled events
        - Network connectivity issues
        - Image pull errors
```

**Security-focused analysis**:
```yaml
prompts:
  system:
    log_analysis:
      content: |
        You are a security analyst reviewing application logs.
        Identify:
        - Authentication failures and brute force attempts
        - Unauthorized access attempts
        - PII exposure in logs (flag as critical)
```

**Database performance tuning**:
```yaml
prompts:
  system:
    log_analysis:
      content: |
        You are a database SRE analyzing query and error logs.
        Analyze:
        - Slow query patterns (>1s)
        - Deadlock occurrences
        - Connection pool exhaustion
        - Index usage and missing indexes
```

#### Template Variables

User prompts support template variables for dynamic content:

```yaml
prompts:
  user:
    followup_query:
      content: "{context}\n\nQuestion: {question}\n\nAnswer concisely."
      supports_templating: true
      required_variables: ["context", "question"]
```

See [config/prompts.example.yaml](config/prompts.example.yaml) for detailed documentation and more examples.

### Environment Variables

See [.env.example](.env.example) for all available environment variables.

Key variables:
- `OPENAI_API_KEY`: OpenAI API key (required for OpenAI provider)
- `ANTHROPIC_API_KEY`: Anthropic API key (required for Anthropic provider)
- `LLM_PROVIDER`: Default provider (**currently supported**: `openai`, `anthropic`. Planned: `openrouter`, `ollama` - see [ROADMAP.md](ROADMAP.md))
- `HYPOTHESIS_COUNT`: Number of hypotheses to generate (1-10)
- `OUTPUT_FORMAT`: Default output format (text, json, csv)

### YAML Configuration

Example `config.yaml`:

```yaml
llm:
  provider: openai
  model: gpt-4
  temperature: 0.0

logs:
  sources:
    - type: local
      path: /var/log/syslog
    - type: local
      path: /var/log/app/error.log
    - type: ssh
      host: web01.example.com
      user: ubuntu
      path: /var/log/nginx/error.log

analysis:
  hypothesis_count: 5
  confidence_threshold: 0.6
  max_log_lines: 10000

output:
  format: json
  output_file: results.json
  verbose: true
```

## CLI Commands

### `analyze`

Analyze log files and generate root cause hypotheses.

```bash
log-analyzer analyze [OPTIONS] LOGFILE
```

**Options**:
- `--provider`: LLM provider (**currently supported**: `openai`, `anthropic`. Note: `openrouter` and `ollama` are planned for v0.2.0 - see [ROADMAP.md](ROADMAP.md))
- `--model`: Model to use (e.g., gpt-4, claude-3-5-sonnet-20241022)
- `--api-key`: API key (overrides environment variable)
- `--hypotheses`: Number of hypotheses to generate (1-10, default: 3)
- `--max-lines`: Maximum log lines to analyze (default: 10000)
- `--format`: Output format (text, json, csv, default: text)
- `--output, -o`: Output file (default: stdout)
- `--prompt-config`: Path to custom prompt configuration YAML file (default: config/prompts.yaml)
- `--no-color`: Disable colored output
- `--verbose, -v`: Verbose logging
- `--config`: YAML configuration file

**Log Sources**:
- **Local file**: `/var/log/syslog`
- **SSH remote**: `ssh://user@host/path/to/log` (URI format)
- **Standard input (stdin)**: Use `-` to read from pipe
  ```bash
  cat error.log | log-analyzer analyze -
  grep ERROR /var/log/app.log | log-analyzer analyze -
  ```

**Note**: For SSH remote log access, use URI format directly as the LOGFILE argument: `ssh://user@host/path` (no separate flag needed)

### `version`

Display version information.

```bash
log-analyzer version
```

### `repl`

Start an interactive REPL (Read-Eval-Print Loop) session for iterative log analysis.

```bash
log-analyzer repl [OPTIONS] LOGFILE
```

The REPL mode allows you to:

- Load logs once and run multiple analyses
- Filter logs by severity level interactively
- Ask follow-up questions about the analysis
- Maintain conversation context across queries
- **Read from standard input** using `-` as the LOGFILE argument

**Log Sources**:

- **Local file**: `/var/log/syslog`
- **SSH remote**: `ssh://user@host/path/to/log` (URI format)
- **Standard input (stdin)**: Use `-` to read from pipe

  ```bash
  cat error.log | log-analyzer repl -
  grep ERROR /var/log/app.log | log-analyzer repl -
  ssh-sudo --host web01 --command "tail -n 1000 /var/log/syslog" | log-analyzer repl -
  ```

**Options**:

- Same options as `analyze` command (see above)

**Available REPL Commands**:

| Command | Description | Example |
| ------- | ----------- | ------- |
| `analyze` | Analyze loaded logs and generate hypotheses | `analyze` |
| `filter <levels>` | Filter logs by severity level | `filter ERROR CRITICAL` |
| `filter reset` | Reset filter to show all logs | `filter reset` |
| `show` | Display current analysis and hypotheses | `show` |
| `show hypotheses` | Display only the hypotheses | `show hypotheses` |
| `help` | Show available commands | `help` |
| `exit` / `quit` | Exit REPL session | `exit` |
| `<question>` | Ask follow-up question | `What caused the timeout?` |

**Filter Examples**:
```bash
# In REPL session
log-analyzer> filter ERROR CRITICAL
Filter applied: ERROR, CRITICAL
Showing 45 of 1523 log entries

log-analyzer> analyze
[Analyzes only ERROR and CRITICAL entries]

log-analyzer> filter WARNING ERROR CRITICAL
Filter applied: WARNING, ERROR, CRITICAL
Showing 234 of 1523 log entries

log-analyzer> filter reset
Filter reset. Showing all 1523 log entries.
```

**Usage Example**:
```bash
# Start REPL with a log file
log-analyzer repl /var/log/app.log --provider anthropic

# Inside REPL:
log-analyzer> filter ERROR CRITICAL
Filter applied: ERROR, CRITICAL
Showing 45 of 1523 log entries

log-analyzer> analyze
[AI analyzes filtered logs...]

log-analyzer> What caused the connection timeout?
[AI responds with context from previous analysis...]

log-analyzer> show hypotheses
[Displays ranked hypotheses]

log-analyzer> exit
```

**Benefits of REPL Mode**:

- **Iterative analysis**: Filter and re-analyze without reloading logs
- **Context preservation**: Follow-up questions maintain conversation history
- **Efficiency**: Load logs once, run multiple queries
- **Interactive filtering**: Test different log level filters quickly

### `ssh-sudo`

Execute commands on remote servers via SSH with sudo support. Outputs stdio text for piping to log-analyzer or other tools.

```bash
ssh-sudo --host HOSTNAME --command COMMAND [OPTIONS]
```

**Features**:

- SSH key-based authentication
- Interactive sudo password prompts via PTY
- Environment variable configuration
- Hostname normalization for password lookup
- Stdio text output support

**Required Arguments**:

- `--host`: Remote hostname or IP address
- `--command`: Shell command to execute on remote host

**Optional Arguments**:

- `--user`: SSH username (default: ubuntu or SSH_USERNAME env var)
- `--port`: SSH port (default: 22)
- `--ssh-key`: Path to SSH private key (default: ~/.ssh/id_rsa or SSH_KEY_PATH env var)
- `--sudo`: Execute command with sudo (requires SSH_SUDO_PASSWORD_* in environment)
- `--timeout`: SSH timeout in seconds (default: 30 or SSH_TIMEOUT env var)

**Environment Variables**:

- `SSH_KEY_PATH`: Default SSH key path
- `SSH_USERNAME`: Default SSH username
- `SSH_TIMEOUT`: Default SSH timeout in seconds
- `SSH_SUDO_PASSWORD_<HOSTNAME>`: Sudo password for specific host (hostname normalized to UPPERCASE_WITH_UNDERSCORES)
- `SSH_SUDO_PASSWORD_DEFAULT`: Default sudo password fallback

**Hostname Normalization**:

Hostnames are normalized for environment variable lookup:

- `web-server-01.example.com` → `WEB_SERVER_01`
- `provisioner.customized.local` → `PROVISIONER`
- Domain suffix removed, dashes → underscores, uppercased

**Usage Examples**:

```bash
# Execute command without sudo
ssh-sudo --host web01 --command "tail -n 100 /var/log/messages"

# Execute command with sudo (requires SSH_SUDO_PASSWORD_WEB01 or DEFAULT)
ssh-sudo --host web01 --sudo --command "cat /var/log/secure"

# Custom SSH port and user
ssh-sudo --host web01 --port 2222 --user ansible --command "journalctl -u nginx"

# Pipe output to log-analyzer
ssh-sudo --host web01 --sudo --command "tail -n 1000 /var/log/messages" | \
  log-analyzer analyze --provider openai -

# Combined with grep for filtering
ssh-sudo --host web01 --sudo --command "cat /var/log/syslog" | \
  grep ERROR | \
  log-analyzer analyze --hypotheses 5 -
```

**Security Notes**:
- Passwords sent via PTY (not in shell commands)
- No command injection vulnerabilities
- Passwords not logged or echoed
- SSH key authentication required

## Filtering Logs

### Filter by Log Level

The AI Log Analyzer processes all log entries you provide. To analyze only errors of a specific severity level, use standard Unix tools to filter logs before analysis.

#### Log Level Hierarchy

From highest to lowest severity:
- **CRITICAL** - Critical system failures
- **ERROR** - Error conditions
- **WARNING** - Warning messages
- **INFO** - Informational messages
- **DEBUG** - Debug/detailed information

#### Filter for Errors Greater Than INFO

To analyze only WARNING, ERROR, and CRITICAL entries (excluding INFO and DEBUG):

**Method 1: Using grep with extended regex**
```bash
grep -E "WARNING|ERROR|CRITICAL" /var/log/app.log | log-analyzer analyze -
```

**Method 2: Using grep with multiple patterns**
```bash
grep -e WARNING -e ERROR -e CRITICAL /var/log/app.log | log-analyzer analyze -
```

**Method 3: Using case-insensitive matching**
```bash
grep -iE "warning|error|critical" /var/log/app.log | log-analyzer analyze -
```

#### Filter for Specific Severity Levels

**Only ERROR and CRITICAL**
```bash
grep -E "ERROR|CRITICAL" /var/log/app.log | log-analyzer analyze -
```

**Only CRITICAL**
```bash
grep "CRITICAL" /var/log/app.log | log-analyzer analyze -
```

#### Combine with Other Filters

**Filter by severity AND time range**
```bash
grep -E "WARNING|ERROR|CRITICAL" /var/log/app.log | \
  grep "2025-01-15" | \
  log-analyzer analyze -
```

**Filter by severity AND exclude patterns**
```bash
grep -E "WARNING|ERROR|CRITICAL" /var/log/app.log | \
  grep -v "expected warning" | \
  log-analyzer analyze -
```

#### Advanced Filtering with awk

**Filter by log level with context preservation**
```bash
awk '/WARNING|ERROR|CRITICAL/' /var/log/app.log | log-analyzer analyze -
```

**Filter with custom field extraction**
```bash
awk '$4 ~ /ERROR|CRITICAL/ {print}' /var/log/app.log | log-analyzer analyze -
```

#### Remote Log Filtering

**Filter remote logs via SSH**
```bash
ssh user@host "grep -E 'WARNING|ERROR|CRITICAL' /var/log/app.log" | \
  log-analyzer analyze -
```

**Or using SSH URI with command chaining**
```bash
# Note: Currently not supported directly, use SSH command above
```

#### Notes

- The `-` argument tells log-analyzer to read from stdin (pipe input)
- Always use quotes around patterns with special characters to prevent shell interpretation
- Case sensitivity matters by default (use `-i` flag for case-insensitive matching)
- **Future enhancement:** Native log level filtering will be added to the CLI in v0.2.0 (see [ROADMAP.md](ROADMAP.md))

#### Performance Tips

For large log files, combine filtering with line limits:
```bash
grep -E "ERROR|CRITICAL" /var/log/large.log | head -n 10000 | \
  log-analyzer analyze --max-lines 10000 -
```

## Output Formats

### Text (Human-Readable)

Colored, formatted output with sections for:
- Log summary and statistics
- AI analysis
- Ranked hypotheses with confidence scores
- Validation steps

### JSON

Structured output for programmatic processing:

```json
{
  "summary": "Analysis of 1,234 log entries...",
  "severity": "critical",
  "hypotheses": [
    {
      "description": "Network connectivity issue between app and database",
      "confidence": 0.85,
      "supporting_evidence": [
        "Multiple 'connection timeout' errors",
        "Errors occurred within 2-minute window"
      ],
      "missing_data": [
        "Network topology",
        "Firewall rule changes"
      ],
      "assumptions": [
        "Database was operational"
      ],
      "validation_steps": [
        {
          "command": "ping db-server.example.com",
          "purpose": "Verify network connectivity"
        }
      ]
    }
  ]
}
```

### CSV

Spreadsheet-compatible format for hypothesis tracking and reporting.

## Development

### Setup Development Environment

```bash
# Create venv and install package with dev dependencies
make setup
source venv/bin/activate

# Or manually
python3.11 -m venv venv
source venv/bin/activate
pip install -e ".[dev]"
```

### Running Tests

```bash
# Run all tests with coverage
make test

# Run specific test categories
make test-unit          # Unit tests only
make test-integration   # Integration tests only
make test-contract      # Contract tests only

# Generate coverage report
make test-cov
# View HTML report: open htmlcov/index.html
```

### Code Quality

```bash
# Run linters
make lint

# Auto-fix linting issues
make lint-fix

# Format code
make format

# Type checking
make type-check

# Run all checks
make check-all
```

### Project Structure

```
AI-log-analyzer/
├── src/log_analyzer/
│   ├── cli/          # CLI entry points
│   ├── config/       # Configuration loading
│   ├── core/         # Core types and exceptions
│   ├── llm/          # LLM provider abstractions
│   ├── logs/         # Log source implementations
│   ├── analysis/     # Hypothesis engine, triage
│   ├── output/       # Output formatters
│   └── mcp/          # Future MCP integration
├── tests/
│   ├── unit/         # Unit tests
│   ├── integration/  # Integration tests
│   └── fixtures/     # Test data
├── AGENT.md          # Architecture documentation
├── CLAUDE.md         # Engineering rules
└── README.md         # This file
```

See [AGENT.md](AGENT.md) for detailed architecture documentation.

## License

Copyright 2025 Roy Kim - Customized Code

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Contributing

This project follows strict Test-Driven Development:

1. Write tests first (red)
2. Implement minimal code to pass tests (green)
3. Refactor (refactor)

Minimum 90% test coverage required for all changes.

## Troubleshooting

### "No API key found"

Ensure you've set the appropriate API key in `.env`:
```bash
OPENAI_API_KEY=sk-proj-xxxxx
```

### "Module not found" errors

Ensure you're in the virtual environment:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### SSH connection issues

**IMPORTANT - SSH URI Format**: The SSH URI format is different from traditional `scp` syntax:

✅ **Correct**: `ssh://user@host/path` (URI format - no colon before path)
❌ **Wrong**: `ssh://user@host:/path` (scp format - doesn't work here)

Use standard URI format for remote logs:
```bash
# Basic SSH
log-analyzer analyze ssh://user@host/var/log/syslog

# With custom port
log-analyzer analyze ssh://user@host:2222/var/log/syslog

# With sudo access (quote the URL to prevent shell interpretation)
log-analyzer analyze "ssh://user@host/var/log/syslog?sudo=true"
```

Check your SSH key path in `.env`:
```bash
SSH_KEY_PATH=~/.ssh/id_rsa
SSH_TIMEOUT=30
```

## Examples

### Analyze Local Syslog

```bash
log-analyzer analyze /var/log/syslog
```

### Analyze with Anthropic Claude

```bash
log-analyzer analyze \
  --provider anthropic \
  --model claude-3-5-sonnet-20241022 \
  app.log
```

### Generate JSON Report

```bash
log-analyzer analyze \
  --format json \
  --output incident-report.json \
  --hypotheses 5 \
  error.log
```

### Filter Logs by Severity

```bash
# Analyze only ERROR and CRITICAL entries
grep -E "ERROR|CRITICAL" /var/log/app.log | \
  log-analyzer analyze \
    --provider openai \
    --format json \
    -

# Analyze WARNING and above from multiple files
cat /var/log/app*.log | grep -E "WARNING|ERROR|CRITICAL" | \
  log-analyzer analyze --hypotheses 5 -
```

### Security-Focused Analysis with Custom Prompts

Use custom prompt configurations to tailor analysis for specific use cases like security incident response, intrusion detection, or compliance monitoring.

```bash
# Analyze logs with security-focused prompts
log-analyzer analyze \
  --prompt-config config/prompts_security.yaml \
  --provider anthropic \
  /var/log/auth.log

# Security analysis in REPL mode with custom prompts
log-analyzer repl \
  --prompt-config config/prompts_security.yaml \
  --provider openai \
  /var/log/secure

# Use custom prompts for database performance analysis
log-analyzer analyze \
  --prompt-config config/prompts_database.yaml \
  --hypotheses 5 \
  /var/log/postgresql/postgres.log
```

#### Creating Custom Prompt Configurations

1. Copy the example file:

   ```bash
   cp config/prompts.example.yaml config/prompts_security.yaml
   ```

2. Uncomment and customize the security-focused prompts in the file (see lines 197-439)

3. Use the custom config with `--prompt-config` flag

#### Available Prompt Variations

In `config/prompts.example.yaml`:

- **Security-focused** (lines 197-439): Intrusion detection, vulnerability analysis, compliance
- **Kubernetes-specific** (lines 119-130): Pod crashes, resource limits, network issues
- **Database performance** (lines 145-156): Slow queries, deadlocks, replication lag

#### Example: Security Analysis Workflow

```bash
# 1. Filter for authentication failures and analyze with security prompts
grep -E "Failed password|authentication failure" /var/log/auth.log | \
  log-analyzer analyze \
    --prompt-config config/prompts_security.yaml \
    --provider anthropic \
    --format json \
    --output security-incident-report.json \
    -

# 2. Interactive security investigation with REPL
log-analyzer repl \
  --prompt-config config/prompts_security.yaml \
  --provider openai \
  /var/log/secure

# Inside REPL:
# log-analyzer> filter ERROR CRITICAL
# log-analyzer> analyze
# log-analyzer> What indicators of compromise were found?
# log-analyzer> What are the recommended containment actions?
```

### Batch Analysis with Configuration File

Process multiple log sources with YAML configuration:

```bash
# Create batch configuration file
cat > config.yaml <<EOF
llm:
  provider: openai
  model: gpt-4o
  api_key: \${OPENAI_API_KEY}

logs:
  sources:
    - name: app-logs
      path: /var/log/app/application.log
    - name: web-logs
      path: ssh://ansible@web01/var/log/nginx/error.log?sudo=true

analysis:
  hypothesis_count: 5
  confidence_threshold: 0.6

output:
  format: json
  output_file: analysis-results.json
EOF

# Run batch analysis
log-analyzer batch config.yaml
```

**Features**:
- Process multiple log sources (local and remote SSH)
- Aggregate results from all sources
- Configurable analysis parameters
- Multiple output formats (text, JSON, CSV)

See [BATCH_CONFIG.md](BATCH_CONFIG.md) for complete configuration documentation and [config/batch.example.yaml](config/batch.example.yaml) for a comprehensive example.

### SSH Remote Log Analysis

**Important**: Use URI format `ssh://user@host/path` - NOT scp format `user@host:/path`

**Shell Quoting**: Always quote URIs with query parameters (`?sudo=true`) to prevent shell interpretation

#### Basic SSH Access

```bash
# Basic SSH (uses default port 22 and username from SSH config or "ubuntu")
log-analyzer analyze ssh://web01.example.com/var/log/nginx/error.log

# Specify username
log-analyzer analyze ssh://ansible@web01.example.com/var/log/messages

# Custom SSH port
log-analyzer analyze ssh://ansible@web01.example.com:2222/var/log/syslog
```

#### SSH with Sudo Access (NEW)

For protected log files (like `/var/log/messages`), use the `sudo=true` query parameter:

```bash
# Quote the URL to prevent shell interpretation of '?'
log-analyzer analyze "ssh://ansible@web01.example.com/var/log/auth.log?sudo=true"
```

**Configure sudo passwords** in `.env`:

```bash
# Server-specific passwords (recommended)
SSH_SUDO_PASSWORD_WEB01=mysecretpassword
SSH_SUDO_PASSWORD_APP_SERVER_01=anothersecret

# Default password for all servers (less secure)
SSH_SUDO_PASSWORD_DEFAULT=defaultpassword
```

**Hostname matching rules**:

- Variable names use uppercase with underscores: `WEB_SERVER_01`
- Hostnames are normalized: `web-server-01.example.com` → `WEB_SERVER_01`
- Example: `ssh://ansible@web-server-01.example.com/var/log/messages?sudo=true`
  - Looks for: `SSH_SUDO_PASSWORD_WEB_SERVER_01`
  - Falls back to: `SSH_SUDO_PASSWORD_DEFAULT`

**Interactive sudo sessions** (Ansible-style):

- Uses PTY (pseudo-terminal) like Ansible
- Detects `[sudo] password for user:` prompt automatically
- Sends password securely (not in shell command)
- Timeout: 30 seconds (configurable via `SSH_TIMEOUT`)

**Troubleshooting sudo issues**:

```bash
# Error: "Sudo password required but not provided"
# → Add SSH_SUDO_PASSWORD_* to .env

# Error: "Sudo password incorrect"
# → Check password in .env matches server sudo password

# Test sudo access manually:
ssh ansible@web01.example.com "sudo tail -n 10 /var/log/messages"
```

#### Combined Examples

```bash
# Combine with other options
log-analyzer analyze \
  --provider anthropic \
  --format json \
  --output remote-analysis.json \
  ssh://ubuntu@provisioner.customized.local/var/log/messages

# Analyze protected file with sudo
log-analyzer analyze \
  --provider openai \
  --hypotheses 5 \
  "ssh://ansible@provisioner.customized.local/var/log/messages?sudo=true"
```

**SSH Authentication**:

The tool uses your SSH key configured in `.env`:

```bash
SSH_KEY_PATH=~/.ssh/id_rsa
SSH_TIMEOUT=30
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the complete development timeline and planned features.

### Currently Implemented (v0.1.0)

- [IMPLEMENTED] **OpenAI GPT-4** - Full integration with all GPT-4 models
- [IMPLEMENTED] **Anthropic Claude** - Full integration with Claude 3.5 and other models
- [IMPLEMENTED] **Local File Sources** - Support for text and gzip-compressed logs
- [IMPLEMENTED] **SSH Remote Access** - Secure remote log access with key/password auth
- [IMPLEMENTED] **Customizable Prompts** - YAML-based prompt configuration system
- [IMPLEMENTED] **Interactive REPL** - Session-based analysis with follow-up questions
- [IMPLEMENTED] **Batch Processing** - Multi-source analysis via YAML configuration
- [IMPLEMENTED] **Multiple Output Formats** - Text, JSON, and CSV output

### Planned for Future Releases

**Version 0.2.0 (Planned)**:
- [PLANNED] **OpenRouter Provider** - Access to 200+ models through unified API
- [PLANNED] **Ollama Provider** - Self-hosted LLM support for on-premises deployment
- [PLANNED] **Journald Log Source** - Native systemd journal integration
- [PLANNED] **CLI Validation** - Improved error messages for invalid providers

**Version 0.3.0 (Planned)**:
- [PLANNED] **TCP Stream Logs** - Real-time log streaming via TCP
- [PLANNED] **Enhanced Pattern Matching** - Improved confidence scoring with pattern recognition

**Future Considerations**:

- [FUTURE] **Vector Database Integration** - Store application context and historical analysis for semantic search
- [FUTURE] **Web Dashboard** - Visual analysis interface with team collaboration features
- [FUTURE] **Notification System** - Email and Slack alerts for critical incidents
- [FUTURE] **MCP Integration** - Model Context Protocol for enhanced context
- [FUTURE] **Machine Learning** - ML-based anomaly detection and pattern recognition

For detailed information on planned features, timelines, and implementation status, see [ROADMAP.md](ROADMAP.md).

## Support

For issues or questions, please refer to:
- [AGENT.md](AGENT.md) - Architecture and development guide
- [CLAUDE.md](CLAUDE.md) - Engineering principles
