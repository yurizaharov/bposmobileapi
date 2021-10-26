const functions = {

    async parallelProcess (callBack, tasksData) {
        const promises = tasksData.map(callBack);
        return await Promise.all(promises);
    },

}

module.exports = functions;
