
class EntityNotFound extends Error {
    constructor(entity, identifier) {
        super(`${entity}(${identifier}) not found`);
    }
}

module.exports = EntityNotFound;
