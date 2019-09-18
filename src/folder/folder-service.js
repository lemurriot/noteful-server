const FolderService = {
    getAllFolders(knex){
        return knex
            .select('*')
            .from('folder')
    },
    getFolderById(knex, id){
        return knex
            .select('*')
            .from('folder')
            .where('id', id)
            .first()
    },
    insertFolder(knex, newFolder){
        return knex
            .insert(newFolder)
            .into('folder')
            .returning('*')
            .then(rows => rows[0])
    },
    deleteFolder(knex, id){
        return knex('folder')
            .where({ id })
            .delete()
    },
    updateFolder(knex, id, newFields){
        return knex('folder')
            .where({ id })
            .update(newFields)
    }
}

module.exports = FolderService