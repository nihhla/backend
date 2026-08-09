const asyncHandler = require('../utils/asyncHandler');

const {
    createChallenge,
    getChallenges,
    getChallenge,
    joinChallenge,
    getMyChallengeProgress,
    updateChallenge,
    deleteChallenge
} = require('../services/challenge.service');

const {
    successResponse
} = require('../utils/response');

const create = asyncHandler(
    async (req, res) => {
        const challenge =
            await createChallenge(
                req.body
            );

        return successResponse(
            res,
            { challenge },
            'Challenge created successfully',
            201
        );
    }
);

const getAll = asyncHandler(
    async (req, res) => {
        const challenges =
            await getChallenges(
                req.user?._id
            );

        return successResponse(
            res,
            { challenges },
            'Challenges fetched successfully'
        );
    }
);

const getSingle = asyncHandler(
    async (req, res) => {
        const challenge =
            await getChallenge(
                req.params.id,
                req.user._id
            );

        return successResponse(
            res,
            { challenge },
            'Challenge fetched successfully'
        );
    }
);

const join = asyncHandler(
    async (req, res) => {
        const result =
            await joinChallenge(
                req.user._id,
                req.params.id
            );

        return successResponse(
            res,
            result,
            result.alreadyJoined
                ? 'Already joined this challenge'
                : 'Challenge joined successfully'
        );
    }
);

const getMyProgress =
    asyncHandler(
        async (req, res) => {
            const progress =
                await getMyChallengeProgress(
                    req.user._id
                );

            return successResponse(
                res,
                { progress },
                'Challenge progress fetched successfully'
            );
        }
    );

const update = asyncHandler(
    async (req, res) => {
        const challenge =
            await updateChallenge(
                req.params.id,
                req.body
            );

        return successResponse(
            res,
            { challenge },
            'Challenge updated successfully'
        );
    }
);

const remove = asyncHandler(
    async (req, res) => {
        await deleteChallenge(
            req.params.id
        );

        return successResponse(
            res,
            null,
            'Challenge deleted successfully'
        );
    }
);

module.exports = {
    create,
    getAll,
    getSingle,
    join,
    getMyProgress,
    update,
    remove
};