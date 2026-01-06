/**
 * n8n API Client Wrapper
 * Provides reusable methods for interacting with n8n API in tests
 */

const axios = require('axios');

class N8nClient {
  constructor(config = {}) {
    this.baseURL = config.baseURL || process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
    this.apiKey = config.apiKey || process.env.N8N_API_KEY;
    this.webhookURL = config.webhookURL || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
    this.timeout = config.timeout || parseInt(process.env.TEST_TIMEOUT || '30000', 10);

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Execute a workflow manually
   * @param {string} workflowId - The workflow ID
   * @param {object} inputData - Input data for the workflow
   * @returns {Promise<object>} Execution result
   */
  async executeWorkflow(workflowId, inputData = {}) {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/execute`, {
        data: inputData,
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'executeWorkflow');
    }
  }

  /**
   * Get workflow execution status
   * @param {string} executionId - The execution ID
   * @returns {Promise<object>} Execution status and data
   */
  async getWorkflowExecutionStatus(executionId) {
    try {
      const response = await this.client.get(`/executions/${executionId}`);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'getWorkflowExecutionStatus');
    }
  }

  /**
   * Wait for execution to complete
   * @param {string} executionId - The execution ID
   * @param {number} maxWaitTime - Maximum wait time in ms
   * @param {number} pollInterval - Poll interval in ms
   * @returns {Promise<object>} Final execution data
   */
  async waitForExecution(executionId, maxWaitTime = 30000, pollInterval = 1000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      const execution = await this.getWorkflowExecutionStatus(executionId);

      if (execution.finished === true) {
        return execution;
      }

      if (execution.stoppedAt) {
        throw new Error(`Execution ${executionId} stopped unexpectedly`);
      }

      await this._sleep(pollInterval);
    }

    throw new Error(`Execution ${executionId} timed out after ${maxWaitTime}ms`);
  }

  /**
   * Get workflow details
   * @param {string} workflowId - The workflow ID
   * @returns {Promise<object>} Workflow configuration
   */
  async getWorkflowDetails(workflowId) {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'getWorkflowDetails');
    }
  }

  /**
   * List all workflow executions
   * @param {string} workflowId - Optional workflow ID filter
   * @param {object} options - Query options (limit, offset, status)
   * @returns {Promise<Array>} List of executions
   */
  async listExecutions(workflowId = null, options = {}) {
    try {
      const params = {
        limit: options.limit || 100,
        ...options,
      };

      if (workflowId) {
        params.workflowId = workflowId;
      }

      const response = await this.client.get('/executions', { params });
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'listExecutions');
    }
  }

  /**
   * Delete an execution
   * @param {string} executionId - The execution ID
   * @returns {Promise<void>}
   */
  async deleteExecution(executionId) {
    try {
      await this.client.delete(`/executions/${executionId}`);
    } catch (error) {
      throw this._handleError(error, 'deleteExecution');
    }
  }

  /**
   * Trigger workflow via webhook
   * @param {string} webhookPath - The webhook path
   * @param {object} data - Webhook payload
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @returns {Promise<object>} Webhook response
   */
  async triggerWebhook(webhookPath, data = {}, method = 'POST') {
    try {
      const url = `${this.webhookURL}/${webhookPath}`;
      const config = {
        method: method.toLowerCase(),
        url,
        timeout: this.timeout,
      };

      if (method.toUpperCase() === 'POST') {
        config.data = data;
      } else {
        config.params = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      throw this._handleError(error, 'triggerWebhook');
    }
  }

  /**
   * Validate workflow output against expected schema
   * @param {object} output - Workflow output data
   * @param {object} schema - Expected schema
   * @returns {object} Validation result { valid: boolean, errors: [] }
   */
  validateWorkflowOutput(output, schema) {
    const errors = [];

    // Check required fields
    if (schema.required) {
      schema.required.forEach(field => {
        if (!(field in output)) {
          errors.push(`Missing required field: ${field}`);
        }
      });
    }

    // Check field types
    if (schema.properties) {
      Object.keys(schema.properties).forEach(field => {
        if (field in output) {
          const expectedType = schema.properties[field].type;
          const actualType = typeof output[field];

          if (expectedType === 'array' && !Array.isArray(output[field])) {
            errors.push(`Field '${field}' should be an array, got ${actualType}`);
          } else if (expectedType !== 'array' && actualType !== expectedType) {
            errors.push(`Field '${field}' should be ${expectedType}, got ${actualType}`);
          }
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get execution data for a specific node
   * @param {object} execution - Execution object
   * @param {string} nodeName - Name of the node
   * @returns {Array} Node output data
   */
  getNodeOutput(execution, nodeName) {
    if (!execution.data || !execution.data.resultData || !execution.data.resultData.runData) {
      return [];
    }

    const nodeData = execution.data.resultData.runData[nodeName];
    if (!nodeData || nodeData.length === 0) {
      return [];
    }

    return nodeData[0].data.main[0] || [];
  }

  /**
   * Check if workflow is active
   * @param {string} workflowId - The workflow ID
   * @returns {Promise<boolean>} True if active
   */
  async isWorkflowActive(workflowId) {
    const workflow = await this.getWorkflowDetails(workflowId);
    return workflow.active === true;
  }

  /**
   * Activate workflow
   * @param {string} workflowId - The workflow ID
   * @returns {Promise<void>}
   */
  async activateWorkflow(workflowId) {
    try {
      await this.client.patch(`/workflows/${workflowId}`, { active: true });
    } catch (error) {
      throw this._handleError(error, 'activateWorkflow');
    }
  }

  /**
   * Deactivate workflow
   * @param {string} workflowId - The workflow ID
   * @returns {Promise<void>}
   */
  async deactivateWorkflow(workflowId) {
    try {
      await this.client.patch(`/workflows/${workflowId}`, { active: false });
    } catch (error) {
      throw this._handleError(error, 'deactivateWorkflow');
    }
  }

  /**
   * Get workflow execution metrics
   * @param {string} workflowId - The workflow ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<object>} Execution metrics
   */
  async getExecutionMetrics(workflowId, days = 7) {
    const executions = await this.listExecutions(workflowId, {
      limit: 1000,
    });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentExecutions = executions.data.filter(exec =>
      new Date(exec.startedAt) > cutoffDate
    );

    const metrics = {
      total: recentExecutions.length,
      successful: 0,
      failed: 0,
      avgDuration: 0,
      totalDuration: 0,
    };

    recentExecutions.forEach(exec => {
      if (exec.finished && !exec.stoppedAt) {
        metrics.successful++;
        const duration = new Date(exec.finishedAt) - new Date(exec.startedAt);
        metrics.totalDuration += duration;
      } else {
        metrics.failed++;
      }
    });

    if (metrics.successful > 0) {
      metrics.avgDuration = Math.round(metrics.totalDuration / metrics.successful);
    }

    return metrics;
  }

  /**
   * Clean up test executions
   * @param {string} workflowId - The workflow ID
   * @param {number} keepLast - Number of executions to keep
   * @returns {Promise<number>} Number of deleted executions
   */
  async cleanupExecutions(workflowId, keepLast = 5) {
    const executions = await this.listExecutions(workflowId);
    const toDelete = executions.data.slice(keepLast);

    let deleted = 0;
    for (const execution of toDelete) {
      try {
        await this.deleteExecution(execution.id);
        deleted++;
      } catch (error) {
        console.warn(`Failed to delete execution ${execution.id}:`, error.message);
      }
    }

    return deleted;
  }

  /**
   * Sleep helper
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle API errors
   * @private
   */
  _handleError(error, method) {
    const message = error.response?.data?.message || error.message;
    const status = error.response?.status;

    const err = new Error(`n8n API Error in ${method}: ${message}`);
    err.status = status;
    err.originalError = error;

    return err;
  }
}

module.exports = N8nClient;
