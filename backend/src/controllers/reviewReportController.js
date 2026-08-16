const reviewReportService = require('../services/reviewReportService');

const postReport = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const { reason, description } = req.body;

    const newReport = await reviewReportService.createReport(req.user.id, ratingId, { reason, description });
    return res.status(201).json({
      status: 'success',
      message: 'Review report submitted successfully for administrator moderation.',
      data: { report: newReport },
    });
  } catch (error) {
    if (error instanceof reviewReportService.ReportError) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  postReport,
};
