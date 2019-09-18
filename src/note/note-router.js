const path = require('path')
const express = require('express')
const xss = require('xss')
const NoteService = require('./note-service')

const jsonParser = express.json()
const noteRouter = express.Router()

const serializeNote = note => ({
    id: note.id,
    note_title: xss(note.note_title),
    date_modified: note.date_modified,
    folder_id: note.folder_id,
    content: xss(note.content)
})

noteRouter
    .route('/')
    .get((req, res, next) => {
      NoteService.getAllNotes(
          req.app.get('db')
      )
      .then(notes => {
          res.status(200).json(notes.map(note => serializeNote(note)))
      })
      .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
      const { note_title, folder_id, content } = req.body
      const newNote = {
          note_title,
          folder_id,
          content
      }
      for (const [key, value] of Object.entries(newNote)){
          if (!value) {
              return res
                .status(400)
                .json({
                    error: { message: `Missing ${key} in request body` }
                })
          }
      }
      NoteService.insertNote(
            req.app.get('db'),
            newNote
      )
      .then(note => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl + `/${note.id}`))
            .json(serializeNote(note))
      })
      .catch(next)
    })

    noteRouter
        .route('/:note_id')
        .all((req, res, next) => {
          NoteService.getNoteById(
              req.app.get('db'),
              req.params.note_id
          )
          .then(note => {
              if (!note){
                  return res.status(404).json({
                      error: { message: "Note doesn't exist" }
                  })
              }
              res.note = note
              next()
          })
          .catch(next)
        })
        .get((req, res, next) => {
          res.json(serializeNote(res.note))
        })
        .delete((req, res, next) => {
          NoteService.deleteNote(
              req.app.get('db'),
              req.params.note_id
          )
          .then(() => {
              res.status(204).end()
          })
          .catch(next)
        })
        .patch(jsonParser, (req, res, next) => {
          const { folder_id, note_title, content } = req.body
          const fieldsToUpdate = { folder_id, note_title, content }
            const numberOfValues = Object.values(fieldsToUpdate).filter(Boolean).length
            if (numberOfValues === 0){
                res.status(400).json({
                    error: { message: `Request body must contain 'folder_id', 'title', or 'content'` }
                })
            }

            NoteService.updateNote(
                req.app.get('db'),
                req.params.note_id,
                fieldsToUpdate
            )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
        })

module.exports = noteRouter