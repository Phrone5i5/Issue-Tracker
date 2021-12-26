'use strict';

const { ObjectID } = require('bson');
const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const ID = new mongoose.Types.ObjectId();

module.exports = function (app) {
  // issue_title, issue_text, and created_by must be entered by user,
  // or else form submission should fail.

  // created_on should automatically be initialized to the time of...
  // ...form submission / issue creation.

  // updated_on should be updated to a new Date() every time an update...
  // ... is PUT to an issue.
  const issueSchema = new Schema({
    project: String,
    _id: mongoose.Types.ObjectId,
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_on: { type: String },
    updated_on: { type: String },
    created_by: { type: String, required: true },
    assigned_to: { type: String },
    open: { type: Boolean, default: true },
    status_text: { type: String },
  });
  const Issue = mongoose.model('Issue', issueSchema);

  app
    .route('/api/issues/:project')
    // Get previous issues
    .get((req, res) => {
      // Get values for all possible search parameters,
      // initializing them to null if they are not provided,
      // and setting them to the user input if they have been
      let paramsObj = {
        project: req.params.project ? req.params.project : null,
        _id: req.body._id ? req.body._id : req.query._id ? req.query._id : null,
        issue_title: req.query.issue_title ? req.query.issue_title : null,
        issue_text: req.query.issue_text ? req.query.issue_text : null,
        created_on: req.query.created_on ? req.query.created_on : null,
        updated_on: req.query.updated_on ? req.query.updated_on : null,
        created_by: req.query.created_by ? req.query.created_by : null,
        assigned_to: req.query.assigned_to ? req.query.assigned_to : null,
        open: req.query.open ? req.query.open : null,
        status_text: req.query.status_text ? req.query.status_text : null,
      };
      // Create a new object from the paramaters object,
      // only including entries with non-null values.
      const filterObj = 
        Object.fromEntries(Object.entries(paramsObj).filter(paramEntry => paramEntry[1] != null));
      // Passing all valid search parameters to find(), then returning them to the user
        Issue.find(filterObj)
        .then((issues) => res.status(200).json(issues))
        .catch((err) => res.status(200).json(err));
    })
    // Handle new form submission
    .post((req, res) => {
      let body = req.body;
      let id = req.body._id ? req.body._id : req.query._id ? req.query._id : null;
      let inputObj = {
        project: req.params.project ? req.params.project : '',
        '_id': id || new mongoose.Types.ObjectId(),
        issue_title: body.issue_title,
        issue_text: body.issue_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: body.created_by,
        assigned_to: body.assigned_to ? body.assigned_to : '',
        status_text: body.status_text ? body.status_text : '',
        open: true
      };
      if (!inputObj.issue_title || !inputObj.issue_text || !inputObj.created_by) {
        res.status(200).json({ error: 'required field(s) missing' });
      } else {
        Issue.create(inputObj)
        .then((issue) => res.status(200).json(issue))
        .catch((err) => res.json(err));
      }
      
    })
    // Update previous issues
    .put((req, res) => {
      let id = req.body._id ? req.body._id : req.query._id ? req.query._id : null;
      let inputObj = {
        issue_title: req.body.issue_title ? req.body.issue_title : null,
        issue_text: req.body.issue_text ? req.body.issue_text : null,
        created_by: req.body.created_by ? req.body.created_by : null,
        assigned_to: req.body.assigned_to ? req.body.assigned_to : null,
        status_text: req.body.status_text ? req.body.status_text : null,
        open: req.body.open ? req.body.open : null
      };
      // Filter the inputObj down to only the keys/values that are not null
      let updatesObj = Object.fromEntries(Object.entries(inputObj).filter(entry => entry[1] != null));
      if (!id) {
        res.status(200).json({ error: 'missing _id' });
      } else if (!Object.keys(updatesObj).length) {
        res.status(200).json({ error: 'no update field(s) sent', '_id': id });
      } else if (id && Object.keys(updatesObj).length) {
        // Add the current time as the "updated_on" key with the value of the current time.
        updatesObj = Object.fromEntries([...Object.entries(updatesObj), ['updated_on', new Date().toISOString()]]);
        Issue.findByIdAndUpdate(id, { $set: updatesObj }, { new: true }, (err, issue) => {
          if (err || !issue) return res.json({ error: 'could not update', '_id': id });
          return res.json({ result: 'successfully updated', '_id': id });
        });
      } else {
        res.status(200).json({ error: 'could not update', '_id': id });
      }
    })
    // Delete previous issues
    .delete((req, res) => {
      let id = req.body._id ? req.body._id : req.query._id ? req.query._id : null;
      if (id) {
        Issue.findByIdAndDelete(id, (err, issue) => {
          if (err || !issue) return res.status(200).json({ error: 'could not delete', '_id': id });
          res.status(200).json({ result: 'successfully deleted', '_id': id});
        });
      } else {
        res.status(200).json({ error: 'missing _id' });
      }
    });
};
