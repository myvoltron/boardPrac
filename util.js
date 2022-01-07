const util = {}; 

util.isLoggedin = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/auth/login'); 
    }
}

util.noPermission = (req, res) => {
    req.logout();
    res.redirect('/auth/login');
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

/*
array : tree구조로 변경할 array
idFiledName : array의 member에서 id를 가지는 field의 이름을 받는다. 
parentIdFieldName : array의 member에서 부모id를 가지는 field의 이름을 받습니다.
childrenFieldName: 생성된 자식들을 넣을 field의 이름을 정하여 넣습니다.
*/

util.convertToTrees = (array, idFieldName, parentIdFieldName, childrenFieldName) => {
    const cloned = array.slice(); // 원본 배열 복사

    for(let i=cloned.length-1; i>-1; i--) {
        const parentId = cloned[i][parentIdFieldName]; 

        if (parentId) {
            const filtered = array.filter((elem) => {
                return elem[idFiledName].toString() == parentId.toString();
            }); 

            if (filtered.length) {
                const parent = filtered[0]; 

                if (parent[childrenFieldName]) {
                    parent[childrenFieldName].unshift(cloned[i]);
                } else {
                    parent[childrenFieldName] = [cloned[i]]; 
                }
            }
            cloned.splice(i, 1); 
        }
    }

    return cloned;
}

module.exports = util; 