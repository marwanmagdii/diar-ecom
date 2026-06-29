// api/utils/logger.js
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

// Extracts the file and line number from an error stack trace
const getCallerInfo = (stackIndex = 3) => {
  const error = new Error();
  const stack = error.stack.split('\n');
  if (stack.length > stackIndex) {
    const callerLine = stack[stackIndex];
    // Match the file path and line number
    const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at (.*):(\d+):(\d+)/);
    if (match) {
      const fullPath = match[1];
      const filename = fullPath.split(/[\/\\]/).pop(); // Get just the filename
      return `${filename}:${match[2]}`;
    }
  }
  return 'Unknown Location';
};

const formatMessage = (level, color, context, message, meta = null) => {
  const timestamp = getTimestamp();
  const location = getCallerInfo(4); // Go back 4 stack frames to get the original caller
  
  let output = `${colors.gray}[${timestamp}]${colors.reset} `;
  output += `${color}${colors.bright}[${level}]${colors.reset} `;
  output += `${colors.cyan}[${context || 'App'}]${colors.reset} `;
  output += `${colors.magenta}(${location})${colors.reset} `;
  output += `${message}`;
  
  if (meta) {
    if (meta instanceof Error) {
      output += `\n\n${colors.red}==================== ERROR DETAILS ====================${colors.reset}`;
      output += `\n${colors.bright}${colors.red}System Layer:${colors.reset} ${context || 'Backend Server'}`;
      output += `\n${colors.bright}${colors.red}Message:${colors.reset} ${meta.message}`;
      output += `\n${colors.bright}${colors.red}Location:${colors.reset} ${location}`;
      output += `\n${colors.bright}${colors.red}Time:${colors.reset} ${timestamp}`;
      
      // If meta has request details (we can pass req to logger)
      if (meta.req) {
          output += `\n${colors.bright}${colors.red}Request Method:${colors.reset} ${meta.req.method}`;
          output += `\n${colors.bright}${colors.red}Request URL:${colors.reset} ${meta.req.url}`;
      }

      if (meta.stack) {
        output += `\n${colors.bright}${colors.red}Stack Trace:${colors.reset}\n${colors.dim}${meta.stack}${colors.reset}`;
      }
      output += `\n${colors.red}=======================================================${colors.reset}\n`;
    } else {
      output += `\n${colors.dim}${JSON.stringify(meta, null, 2)}${colors.reset}`;
    }
  }
  
  return output;
};

export const logger = {
  info: (context, message, meta) => {
    console.log(formatMessage('INFO', colors.blue, context, message, meta));
  },
  success: (context, message, meta) => {
    console.log(formatMessage('SUCCESS', colors.green, context, message, meta));
  },
  warn: (context, message, meta) => {
    console.warn(formatMessage('WARN', colors.yellow, context, message, meta));
  },
  error: (context, message, errorObj) => {
    console.error(formatMessage('ERROR', colors.red, context, message, errorObj));
  }
};
