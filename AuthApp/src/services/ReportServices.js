import { api, API_BASE_URL } from "../api/api";

export const getReportCount = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/reports/count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report count:", error);
    throw error;
  }
};

export const createReport = async (reportData) => {
  try {
    const response = await api.post(`${API_BASE_URL}/api/reports`, reportData);
    return response.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

export const reportBook = async ({ bookId, reason }) => {
  try {
    const reportData = {
      reason: reason,
      book: {
        id: bookId,
      },
    };
    console.log("Reporting book with ID:", reportData.book, "and reason:", reportData.reason);
    return await createReport(reportData);
  } catch (error) {
    console.error("Error reporting book:", error);
    throw error;
  }
};

export const reportChapter = async ({ chapterId, reason }) => {
  try {
    const reportData = {
      reason: reason,
      chapter: {
        id: chapterId,
      },
    };
    return await createReport(reportData);
  } catch (error) {
    console.error("Error reporting chapter:", error);
    throw error;
  }
};

export const reportComment = async ({ commentId, reason }) => {
  try {
    const reportData = {
      reason: reason,
      comment: {
        id: commentId,
      },
    };
    return await createReport(reportData);
  } catch (error) {
    console.error("Error reporting comment:", error);
    throw error;
  }
};

/**
 * Fetch all reports with optional filters
 * @param {Object} options - Filter options
 * @returns {Promise} - Promise with reports data
 */
export const getAllReports = async ({ page = 0, size = 20, sort = "reportedDate,desc", resolved = null, type = null }) => {
  try {
    let url = `${API_BASE_URL}/api/reports?page=${page}&size=${size}&sort=${sort}`;

    // Convert resolved to the correct format for the backend
    if (resolved !== null) {
      url += `&isResolved=${resolved}`;
    }

    // Handle type filtering
    if (type) {
      // Map front-end type values to backend entity filtering
      switch (type) {
        case "book":
          url += "&hasBook=true";
          break;
        case "chapter":
          url += "&hasChapter=true";
          break;
        case "comment":
          url += "&hasComment=true";
          break;
        case "user":
          url += "&hasUser=true";
          break;
      }
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

/**
 * Get a single report by ID
 * @param {number} reportId - The report ID
 * @returns {Promise} - Promise with report data
 */
export const getReportById = async (reportId) => {
  try {
    const response = await api.get(`${API_BASE_URL}/api/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report #${reportId}:`, error);
    throw error;
  }
};

/**
 * Mark a report as resolved
 * @param {number} reportId - The report ID
 * @param {boolean} resolved - Resolution status
 * @returns {Promise} - Promise with updated report
 */
export const resolveReport = async (reportId, resolved = true) => {
  try {
    // Use PUT method as specified in the controller
    if (resolved) {
      // Call the resolve endpoint
      const response = await api.put(`${API_BASE_URL}/api/reports/${reportId}/resolve`);
      return response.data;
    } else {
      // For unresolving, we'll need a custom endpoint on the backend
      // As a fallback, we could use a PATCH or similar endpoint
      const response = await api.patch(`${API_BASE_URL}/api/reports/${reportId}`, { isResolved: false });
      return response.data;
    }
  } catch (error) {
    console.error(`Error ${resolved ? "resolving" : "unresolving"} report #${reportId}:`, error);
    throw error;
  }
};

/**
 * Delete a report
 * @param {number} reportId - The report ID
 * @returns {Promise} - Promise with result
 */
export const deleteReport = async (reportId) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/api/reports/${reportId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting report #${reportId}:`, error);
    throw error;
  }
};

/**
 * Delete reported object (content) and resolve the report
 * @param {number} reportId - The report ID
 * @returns {Promise} - Promise with result
 */
export const deleteReportedObject = async (reportId) => {
  try {
    const response = await api.delete(`${API_BASE_URL}/api/reports/${reportId}/delete-object`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting reported object for report #${reportId}:`, error);
    throw error;
  }
};
