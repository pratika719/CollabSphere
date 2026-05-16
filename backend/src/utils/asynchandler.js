const asynchandler = (fn) => {
    return async (req, res, next) => {
        try {
            await Promise.resolve(
                fn(req, res, next)
            );
        } catch (error) {
            next(error);
        }
    };
};

export default asynchandler;