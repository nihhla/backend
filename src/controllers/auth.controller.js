const asyncHandler = require('../utils/asyncHandler');

const {
    registerStudent,
    loginUser,
    getCurrentUser,
    getAllStudents: getAllStudentsService,
    deleteStudent
} = require('../services/auth.service');

const { successResponse } = require('../utils/response');

const register = asyncHandler(async (req, res) => {
    const result = await registerStudent(req.body);

    return successResponse(
        res,
        result,
        'Registration successful',
        201
    );
});

const login = asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);

    return successResponse(
        res,
        result,
        'Login successful'
    );
});

const getMe = asyncHandler(async (req, res) => {
    const user = await getCurrentUser(
        req.user._id
    );

    return successResponse(
        res,
        { user },
        'Current user fetched successfully'
    );
});

const getAllStudents = asyncHandler(
    async (req, res) => {
        const result =
            await getAllStudentsService(
                req.query
            );

        return successResponse(
            res,
            result,
            'Students fetched successfully'
        );
    }
);

const deleteStudentController = asyncHandler(
    async (req, res) => {
        const result = await deleteStudent(
            req.params.id
        );

        return successResponse(
            res,
            result,
            'Student deleted successfully'
        );
    }
);

module.exports = {
    register,
    login,
    getMe,
    getAllStudents,
    deleteStudentController
};