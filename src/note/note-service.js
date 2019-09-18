const NoteService = {
    getAllNotes(knex){
        return knex
            .select('*')
            .from('note')
    },
    getNoteById(knex, id){
        return knex
            .select('*')
            .from('note')
            .where('id', id)
            .first()
    },
    insertNote(knex, newNote){
        return knex
            .into('note')
            .insert(newNote)
            .returning('*')
            .then(rows => rows[0])
    },
    deleteNote(knex, id){
        return knex('note')
            .where({ id })               
            .delete()
    },
    updateNote(knex, id, updatedFields){
        return knex('note')
            .where({ id })
            .update(newFields)
    }
}

module.exports = NoteService