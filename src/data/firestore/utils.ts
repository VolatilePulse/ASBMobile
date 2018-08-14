import firebase from 'firebase/app';

/** A value to use in a set/update when you want Firestore to delete a field */
export function deleteFieldValue() {
   return firebase.firestore.FieldValue.delete();
}
