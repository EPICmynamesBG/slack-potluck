const { unixFromDate, dateFromUnix } = require("../helpers/datetime");
const PayloadHelper = require("../helpers/PayloadHelper");
const db = require("../models");
const ManageMeetupModal = require("../views/ManageMeetupModal");
const MeetupUpdatedEphemeral = require("../views/ManageMeetupModal/MeetupUpdatedEphemeral");
const UpdateAnnouncementPosting = require("./UpdateAnnouncementPosting");

class UpdateMeetup {
  static _fieldIsChanged(originalValue, proposedValue = undefined) {
    if (proposedValue === undefined) {
      return false;
    }
    return originalValue !== proposedValue;
  }

  static meetupChanges(meetup, updatePayload = {}) {
    const {
      additionalNotes,
      includeFoodSignup,
      when,
      whereFriendly,
      whereAddress,
    } = updatePayload;

    const changes = {};
    if (this._fieldIsChanged(meetup.additionalNotes, additionalNotes)) {
      changes.additionalNotes = [meetup.additionalNotes, additionalNotes];
    }
    if (this._fieldIsChanged(meetup.includeFoodSignup, includeFoodSignup)) {
      changes.includeFoodSignup = [meetup.includeFoodSignup, includeFoodSignup];
    }
    if (this._fieldIsChanged(unixFromDate(meetup.timestamp), when)) {
      changes.timestamp = [unixFromDate(meetup.timestamp), when];
    }
    if (this._fieldIsChanged(meetup.locationAlias, whereFriendly)) {
      changes.locationAlias = [meetup.locationAlias, whereFriendly];
    }
    if (this._fieldIsChanged(meetup.locationAddress, whereAddress)) {
      changes.locationAddress = [meetup.locationAddress, whereAddress];
    }
    return changes;
  }

  static async applyMeetupChanges(meetup, changes) {
    Object.keys(changes).forEach((field) => {
      let newValue = changes[field][1];
      if (field === "timestamp") {
        newValue = dateFromUnix(newValue);
      }
      meetup[field] = newValue;
    });
    meetup.updatedAt = new Date();
    await meetup.save();
    return meetup;
  }

  static async execute(payload) {
    const { client } = payload;
    const payloadHelper = new PayloadHelper(payload);
    const viewState = payloadHelper.getState();
    const formValues = ManageMeetupModal.getFormValues(viewState);
    const { meetupId, channel = payloadHelper.getChannel() } =
      payloadHelper.getPrivateMetadata();
    const meetup = await db.Meetup.findByPk(meetupId);
    if (!meetup) {
      throw new Error(`Meetup ${meetupId} not found`);
    }
    const changes = this.meetupChanges(meetup, formValues);
    if (Object.keys(changes).length === 0) {
      console.debug("No changes made to meetup");
      return;
    }
    await this.applyMeetupChanges(meetup, changes);

    UpdateAnnouncementPosting.defer(client, meetup.id, changes);
    await client.chat.postEphemeral({
      channel,
      user: payloadHelper.getUserId(),
      text: "Meeting updated! Existing announcements will automatically update 5 minutes from your last edit.",
      blocks: MeetupUpdatedEphemeral.render(meetup),
    });
  }
}

module.exports = UpdateMeetup;
