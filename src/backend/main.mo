import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";

actor {
  include MixinStorage();

  public query func isStripeConfigured() : async Bool {
    switch (stripeConfiguration) {
      case (null) { false };
      case (?_) { true };
    };
  };

  var stripeConfiguration : ?Stripe.StripeConfiguration = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module StudyNote {
    public func compare(left : StudyNote, right : StudyNote) : Order.Order {
      switch (Text.compare(left.subject, right.subject)) {
        case (#equal) { left.title.compare(right.title) };
        case (other) { other };
      };
    };
  };

  public type StudyNote = {
    id : Text;
    title : Text;
    description : Text;
    subject : Text;
    price : Nat;
    seller : Principal;
    content : Storage.ExternalBlob;
  };

  public type StudyNotesMarketplace = {
    availableNotes : Map.Map<Text, StudyNote>;
    userCredits : Nat;
    purchasedNotes : Map.Map<Text, StudyNote>;
  };

  public type UserProfile = {
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let studyNotesMarketplace = Map.empty<Principal, StudyNotesMarketplace>();
  var nextNoteId : Nat = 0;

  // Handles HTTP transform calls for Stripe and other HTTP requests
  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  // Payment integration using Stripe
  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := ?config;
  };

  func getStripeConfigOrTrap() : Stripe.StripeConfiguration {
    switch (stripeConfiguration) {
      case (null) { Runtime.trap("Stripe must be configured first") };
      case (?config) { config };
    };
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfigOrTrap(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfigOrTrap(), caller, items, successUrl, cancelUrl, transform);
  };

  // User Profile Functions (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Marketplace Functions
  public shared ({ caller }) func createStudyNotesMarketplace() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create accounts");
    };
    if (studyNotesMarketplace.containsKey(caller)) {
      Runtime.trap("Marketplace already exists for this user");
    };
    let marketplace : StudyNotesMarketplace = {
      availableNotes = Map.empty<Text, StudyNote>();
      userCredits = 0;
      purchasedNotes = Map.empty<Text, StudyNote>();
    };
    studyNotesMarketplace.add(caller, marketplace);
  };

  public shared ({ caller }) func addCredits(credits : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add credits");
    };
    let marketplace = switch (studyNotesMarketplace.get(caller)) {
      case (null) { Runtime.trap("No study notes marketplace available for this user") };
      case (?marketplace) { marketplace };
    };
    studyNotesMarketplace.add(caller, {
      availableNotes = marketplace.availableNotes;
      userCredits = marketplace.userCredits + credits;
      purchasedNotes = marketplace.purchasedNotes;
    });
  };

  public shared ({ caller }) func createNoteListing(
    title : Text,
    description : Text,
    subject : Text,
    price : Nat,
    content : Storage.ExternalBlob
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create note listings");
    };
    let noteId = nextNoteId.toText();
    nextNoteId += 1;

    let note : StudyNote = {
      id = noteId;
      title = title;
      description = description;
      subject = subject;
      price = price;
      seller = caller;
      content = content;
    };

    // Add to all users' available notes (marketplace-wide listing)
    for ((userPrincipal, marketplace) in studyNotesMarketplace.entries()) {
      if (userPrincipal != caller) {
        marketplace.availableNotes.add(noteId, note);
      };
    };

    noteId;
  };

  public query ({ caller }) func getSubjects() : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view subjects");
    };
    let marketplace = switch (studyNotesMarketplace.get(caller)) {
      case (null) { Runtime.trap("No study notes marketplace available for this user") };
      case (?marketplace) { marketplace };
    };
    let subjectsSet = Set.empty<Text>();
    for (note in marketplace.availableNotes.values()) {
      subjectsSet.add(note.subject);
    };
    subjectsSet.toArray();
  };

  public shared ({ caller }) func buyStudyNote(noteId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can buy notes");
    };
    let marketplace = switch (studyNotesMarketplace.get(caller)) {
      case (null) { Runtime.trap("No study notes marketplace available for this user") };
      case (?marketplace) { marketplace };
    };
    if (marketplace.purchasedNotes.containsKey(noteId)) {
      Runtime.trap("Note already purchased");
    };
    let note = switch (marketplace.availableNotes.get(noteId)) {
      case (null) { Runtime.trap("Study note not available") };
      case (?note) { note };
    };
    if (marketplace.userCredits < note.price) {
      Runtime.trap("Not enough credits to buy note");
    };
    marketplace.availableNotes.remove(noteId);
    marketplace.purchasedNotes.add(noteId, note);
    studyNotesMarketplace.add(
      caller,
      {
        availableNotes = marketplace.availableNotes;
        userCredits = marketplace.userCredits - note.price;
        purchasedNotes = marketplace.purchasedNotes;
      },
    );

    // Transfer credits to seller
    let sellerMarketplace = switch (studyNotesMarketplace.get(note.seller)) {
      case (null) { return }; // Seller account doesn't exist
      case (?m) { m };
    };
    studyNotesMarketplace.add(
      note.seller,
      {
        availableNotes = sellerMarketplace.availableNotes;
        userCredits = sellerMarketplace.userCredits + note.price;
        purchasedNotes = sellerMarketplace.purchasedNotes;
      },
    );
  };

  public query ({ caller }) func getAvailableStudyNotes() : async [StudyNote] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view available notes");
    };
    let marketplace = switch (studyNotesMarketplace.get(caller)) {
      case (null) { Runtime.trap("No study notes marketplace available for this user") };
      case (?marketplace) { marketplace };
    };
    marketplace.availableNotes.values().toArray().sort();
  };

  public query ({ caller }) func getPurchasedStudyNotes() : async [StudyNote] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view purchased notes");
    };
    let marketplace = switch (studyNotesMarketplace.get(caller)) {
      case (null) { Runtime.trap("No study notes marketplace available for this user") };
      case (?marketplace) { marketplace };
    };
    marketplace.purchasedNotes.values().toArray().sort();
  };

  public query ({ caller }) func getUserCredits() : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view credits");
    };
    let marketplace = switch (studyNotesMarketplace.get(caller)) {
      case (null) { Runtime.trap("No study notes marketplace available for this user") };
      case (?marketplace) { marketplace };
    };
    marketplace.userCredits;
  };

  public query ({ caller }) func getStudyNote(noteId : Text) : async ?StudyNote {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view notes");
    };
    let marketplace = switch (studyNotesMarketplace.get(caller)) {
      case (null) { Runtime.trap("No study notes marketplace available for this user") };
      case (?marketplace) { marketplace };
    };
    // Check if user has purchased this note
    marketplace.purchasedNotes.get(noteId);
  };
};
