const asyncHandler = require('../utils/asyncHandler');

const {
    getStudentAnalytics,
    getAdminAnalytics,
    getReadingActivity,
    getTopReaders
} = require('../services/analytics.service');

const {
    successResponse
} = require('../utils/response');

const getStudentDashboard =
    asyncHandler(
        async (req, res) => {
            const analytics =
                await getStudentAnalytics(
                    req.user._id
                );

            return successResponse(
                res,
                { analytics },
                'Student analytics fetched successfully'
            );
        }
    );

const getAdminDashboard =
    asyncHandler(
        async (req, res) => {
            const analytics =
                await getAdminAnalytics();

            return successResponse(
                res,
                { analytics },
                'Admin analytics fetched successfully'
            );
        }
    );

const getActivity =
    asyncHandler(
        async (req, res) => {
            const activity =
                await getReadingActivity(
                    req.user._id
                );

            return successResponse(
                res,
                { activity },
                'Reading activity fetched successfully'
            );
        }
    );

const getLeaderboard =
    asyncHandler(
        async (req, res) => {
            const readers =
                await getTopReaders();

            return successResponse(
                res,
                { readers },
                'Top readers fetched successfully'
            );
        }
    );

module.exports = {
    getStudentDashboard,
    getAdminDashboard,
    getActivity,
    getLeaderboard
};