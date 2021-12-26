const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const { expect } = require('chai');
const { ObjectId } = require('mongodb');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    // POST requests
    // 1
    test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
                issue_title: 'Test issue title',
                issue_text: 'Test issue text',
                created_by: 'Chai',
                assigned_to: 'Chai',
                status_text: 'In QA'
            })
            .end((err, res) => {
                let resObj = JSON.parse(res.text);
                // Check if response received successfully
                assert.equal(res.status, 200, 'Response status should be 200');
                // Check if response object contains all keys
                expect(resObj, 'res._id should exist').to.have.property('_id');
                expect(resObj, 'res.issue_title should exist').to.have.property('issue_title');
                expect(resObj, 'res.issue_text should exist').to.have.property('issue_text');
                expect(resObj, 'res.created_on should exist').to.have.property('created_on');
                expect(resObj, 'res.updated_on should exist').to.have.property('updated_on');
                expect(resObj, 'res.created_by should exist').to.have.property('created_by');
                expect(resObj, 'res.assigned_to should exist').to.have.property('assigned_to');
                expect(resObj, 'res.open should exist').to.have.property('open');
                expect(resObj, 'res.status_text should exist').to.have.property('status_text');
                // Check to see if all response object keys have values
                expect(resObj._id).to.be.a('string');
                expect(resObj.issue_title).to.equal('Test issue title');
                expect(resObj.issue_text).to.equal('Test issue text');
                expect(resObj.created_on).to.be.a('string');
                expect(resObj.updated_on).to.be.a('string');
                expect(resObj.created_by).to.equal('Chai');
                expect(resObj.assigned_to).to.equal('Chai');
                expect(resObj.open).to.equal(true);
                expect(resObj.status_text).to.equal('In QA');
            });
        done();
    });
    // 2
    test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
                issue_title: 'Test issue title1',
                issue_text: 'Test issue text',
                created_by: 'Chai'
            })
            .end((err, res) => {
                let resObj = JSON.parse(res.text);
                // Check if response received successfully
                assert.equal(res.status, 200, 'Response status should be 200');
                // Check if response object contains all keys
                expect(resObj, 'res._id should exist').to.have.property('_id');
                expect(resObj, 'res.issue_title should exist').to.have.property('issue_title');
                expect(resObj, 'res.issue_text should exist').to.have.property('issue_text');
                expect(resObj, 'res.created_on should exist').to.have.property('created_on');
                expect(resObj, 'res.updated_on should exist').to.have.property('updated_on');
                expect(resObj, 'res.created_by should exist').to.have.property('created_by');
                expect(resObj, 'res.assigned_to should exist').to.have.property('assigned_to');
                expect(resObj, 'res.open should exist').to.have.property('open');
                expect(resObj, 'res.status_text should exist').to.have.property('status_text');
                // Check to see if all response object keys have values
                expect(resObj._id).to.be.a('string');
                expect(resObj.issue_title).to.equal('Test issue title1');
                expect(resObj.issue_text).to.equal('Test issue text');
                expect(resObj.created_on).to.be.a('string');
                expect(resObj.updated_on).to.be.a('string');
                expect(resObj.created_by).to.equal('Chai');
                expect(resObj.assigned_to).to.a('string');
                expect(resObj.open).to.equal(true);
                expect(resObj.status_text).to.equal('');
            });
        done();
    });
    // 3
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
                assigned_to: 'Chai'
            })
            .end((err, res) => {
                assert.isNotOk(err, 'err should not be truthy');
                let resObj = JSON.parse(res.text);
                expect(resObj).to.have.property('error');
            });
        done();
    });
    // GET requests
    // 4
    test('View issues on a project: GET request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .get('/api/issues/apitest')
            .end((err, res) => {
                let resObj = JSON.parse(res.text);
                assert.equal(res.status, 200, 'res.status should be 200');
                assert.isOk(resObj, 'resObj should be truthy');
                assert.deepInclude(resObj[0], {
                    issue_text: 'Test issue text',
                    created_by: 'Chai'
                }, 'resObj should include previous entries to /api/issues/apitest');
            });
        done();
    });
    // 5
    test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .get('/api/issues/apitest')
            .query({ created_by: 'Chai' })
            .end((err, res) => {
                assert.isNotOk(err, 'err should not be truthy');
                let resObj = JSON.parse(res.text);
                assert.equal(res.status, 200, 'res.status should be 200');
                assert.deepInclude(resObj[0], {
                    created_by: 'Chai'
                }, 'resObj should include queried field and its value');
            });
        done();
    });
    // 6
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .get('/api/issues/apitest')
            .query({
                issue_title: 'Test issue title',
                assigned_to: 'Chai'
            })
            .end((err, res) => {
                assert.isNotOk(err, 'err should not be truthy');
                let resObj = JSON.parse(res.text);
                assert.equal(res.status, 200, 'res.status should be 200');
                assert.deepInclude(resObj[0], {
                    issue_title: 'Test issue title',
                    assigned_to: 'Chai'
                }, 'reObj should contain all queried field and their values'); 
            });
        done();
    });
    // PUT requests
    // 7
    test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
        const idToUpdate = new ObjectId().toString();
        chai
            .request(server)
            .post('/api/issues/apitest')
            .type('form')
            .query({
                _id: idToUpdate
            })
            .send({
                issue_title: 'Testing single field update title',
                issue_text: 'Test issue text',
                created_by: 'Chai'
            })
            .end((err, res) => {
                assert.isNotOk(err, 'err should not be truthy');
                chai
                    .request(server)
                    .put('/api/issues/apitest')
                    .query({
                        _id: idToUpdate
                    })
                    .send({
                        issue_title: 'Test title changed! Whee'
                    })
                    .end((err, res) => {
                        assert.isNotOk(err, 'err should not be truthy');
                        let resObj = JSON.parse(res.text);
                        assert.equal(res.status, 200, 'res.status should be 200');
                        assert.deepEqual(resObj, { result: 'successfully updated', _id: idToUpdate }, 'resObj should contain a successful result and the _id');
                    });
            });
        done();
    });
    // 8
    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', async (done) => {
        const idToUpdateMultiple = new ObjectId().toString();
        chai
            .request(server)
            .post('/api/issues/apitest')
            .type('form')
            .query({
                _id: idToUpdateMultiple
            })
            .send({
                issue_title: 'Testing single field update title',
                issue_text: 'Test issue text',
                created_by: 'Chai'
            })
            .end((err, res) => {
                assert.isNotOk(err, 'err should not be truthy');
                chai
                    .request(server)
                    .put('/api/issues/apitest')
                    .query({
                        _id: idToUpdateMultiple
                    })
                    .send({
                        status_text: 'Still in QA! Still!',
                        issue_title: 'Test title changed! Again!'
                    })
                    .end((err, res) => {
                        assert.isNotOk(err, 'err should not be truthy');
                        let resObj = JSON.parse(res.text);
                        assert.equal(res.status, 200, 'res.status should be 200');
                        assert.deepEqual(resObj, { result: 'successfully updated', _id: idToUpdateMultiple }, 'resObj should contain an updated title');
                    });
            });
        done();
    });
    // 9
    test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .put('/api/issues/apitest')
            .query({
                issue_title: 'Test title changed! Again! No _id! Mwahaha!',
            })
            .end((err, res) => {
                assert.isNotOk(err, 'err should not be truthy');
                let resObj = JSON.parse(res.text);
                assert.deepEqual(resObj, { error: 'missing _id' }, 'resObj should contain an error concerning the missing _id');
            });
        done();
    });
    // 10
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
        const idToUpdateNoFields = new ObjectId().toString();
        chai
            .request(server)
            .post('/api/issues/apitest')
            .type('form')
            .query({
                _id: idToUpdateNoFields
            })
            .send({
                issue_title: 'This title should not update',
                issue_text: 'This text should not update, nor this, because there should not be any fields sent',
                created_by: 'Chai'
            })
            .end((err, res) => {
                assert.isNotOk(err, 'err should not be truthy');
                chai
                    .request(server)
                    .put('/api/issues/apitest')
                    .query({ _id: idToUpdateNoFields })
                    .end((err, res) => {
                        assert.isNotOk(err, 'err should not be truthy');
                        let resObj = JSON.parse(res.text);
                        assert.deepEqual(resObj, { error: 'no update field(s) sent', _id: idToUpdateNoFields }, 'res.text should indicate no update fields were sent');
                    });
            });
        done();
    });
    // 11
    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
        chai 
            .request(server)
            .put('/api/issues/apitest')
            .query({ _id: 'this is not a valid id' })
            .send({
                issue_title: 'IF THIS TITLE UPDATES YOU MESSED UP!'
            })
            .end((err, res) => {
                assert.isNotOk(err, 'err should not be truthy');
                let resObj = JSON.parse(res.text);
                assert.deepEqual(resObj, { error: 'could not update', _id: 'this is not a valid id' }, 'resObj should indicate an invalid id was sent');
            });
        done();
    });
    // DELETE requests
    // 12
    test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
        const idToDel = new ObjectId();
        chai
            .request(server)
            .post('/api/issues/apitest')
            .type('form')
            .send({
                issue_title: 'PLEASE DELETE ME',
                issue_text: 'I REALLY WANT YOU TO',
                created_by: 'Chai',
                assigned_to: 'Chai',
                status_text: 'In QA',
                _id: idToDel
            })
            .end((err, res) => {
                let resObj = JSON.parse(res.text);
                chai
                    .request(server)
                    .delete('/api/issues/apitest')
                    .send({ _id: idToDel })
                    .end((err, res) => {
                        let resObj = JSON.parse(res.text);
                        assert.isNotOk(err, 'err should not be truthy');
                        assert.equal(res.status, 200, 'res.status should be 200');
                    });
            });
        done();
    });
    // 13
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .delete('/api/issues/apitest')
            .send({ _id: 'this is an invalid id' })
            .end((err, res) => {
                let resObj = JSON.parse(res.text);
                assert.isNotOk(err, 'err should not be truthy');
                assert.include(resObj, { error: 'could not delete', _id: 'this is an invalid id' });
            });
        done();
    });
    // 14
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', (done) => {
        chai
            .request(server)
            .delete('/api/issues/apitest')
            .send({ issue_title: 'PLEASE DELETE ME' })
            .end((err, res) => {
                let resObj = JSON.parse(res.text);
                assert.isNotOk(err, 'err should not be truthy');
                assert.include(resObj, { error: 'missing _id' });
            });
        done();
    });

});
