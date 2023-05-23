const config = require("../config");
const calendarId = config.get().calendarId;
const fs = require('fs').promises;
const EventController = {}
const CREDENTIALS_PATH = config.get().googleCredentialsFilePath;
const TOKEN_PATH = config.get().googleCredentialsTokenPath;
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const {google} = require('googleapis');
EventController.listColors = async function (req, res) {
    let calendar = await EventController._buildCalendarApi();
    let response = await calendar.colors.get();
    res.send(response.data);
};
EventController.list = async function (req, res) {
    let calendar = await EventController._buildCalendarApi();
    const minDate = new Date(req.query.minDate).toISOString()
    const maxDate = new Date(req.query.maxDate).toISOString()
    let response = await calendar.events.list({
        calendarId: calendarId,
        timeMin: minDate,
        timeMax: maxDate,
        singleEvents: true
    });
    const events = response.data.items;
    res.send(events);
}

EventController.add = async function (req, res) {
    let calendar = await EventController._buildCalendarApi();
    const event = req.body;
    const response = await calendar.events.insert({
        calendarId: calendarId,
        resource: event,
    });
    res.send(response.data);
}

EventController.update = async function (req, res) {
    let calendar = await EventController._buildCalendarApi();
    const event = req.body;
    const eventId = req.params.eventId
    if (eventId !== event.id) {
        return res.sendStatus(400)
    }
    const response = await calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        resource: event,
    });
    res.send(response.data)
}

EventController.delete = async function (req, res) {
    let calendar = await EventController._buildCalendarApi();
    const eventId = req.params.eventId
    const response = await calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId
    });
    console.log(response)
    res.sendStatus(200);
}

EventController._buildCalendarApi = function () {
    const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_PATH,
        scopes: SCOPES,
    });
    return google.calendar({version: 'v3', auth});
};

module.exports = EventController;
