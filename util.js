const util = {}; 

util.isLoggedin = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/auth/login'); 
    }
}

util.getPostQueryString = (req, res, next) => {
    res.locals.getPostQueryString = (isAppended=false, overwrites={}) => {
        let queryString = '';
        const queryArray = [];
        const page = overwrites.page ? overwrites.page : (req.query.page ? req.query.page : ''); 
        const limit = overwrites.limit ? overwrites.limit : (req.query.limit ? req.query.limit : ''); 

        if (page) queryArray.push('page='+page);
        if (limit) queryArray.push('limit='+limit);

        if (queryArray.length > 0) 
            queryString = (isAppended ? '&' : '?') + queryArray.join('&'); 
        
        return queryString; 
    }

    next(); 
}

module.exports = util; 