/**
 * Helper to determine if a user has access to a specific election.
 * - Admin Sistem (role: 'admin') can access all elections.
 * - Pemilih (role: 'voter') can access elections.
 * - Admin Pemilihan (role: 'election_admin') can ONLY access elections if:
 *   1. The creator's category matches the user's category.
 *   2. ALL user category attributes specified by the creator match the user's category attributes.
 */
export function canAccessElection(user: any, election: any): boolean {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'voter') return true;
  if (user.role !== 'election_admin') return false;

  const userCat = user.category || '';
  const elCat = election.creatorCategory || election.rules?.creatorCategory || '';

  // If the election has no creatorCategory (legacy election without restrictions), allow access
  if (!elCat) return true;
  // If election has creator category but election_admin has no category, deny access
  if (!userCat) return false;
  // Category MUST match
  if (userCat !== elCat) return false;

  // Check creator attributes matching
  const userAttrs = user.attributes || {};
  const elAttrs = election.creatorAttributes || election.rules?.creatorAttributes || {};

  const elAttrKeys = Object.keys(elAttrs);
  if (elAttrKeys.length > 0) {
    for (const key of elAttrKeys) {
      const elVal = elAttrs[key];
      const userVal = userAttrs[key];
      // If creator set an attribute value (e.g. fakultas: 'Teknik Informatika'), user's attribute MUST match!
      if (elVal !== undefined && elVal !== null && elVal !== '' && String(userVal) !== String(elVal)) {
        return false;
      }
    }
  }

  const userAttrKeys = Object.keys(userAttrs);
  if (userAttrKeys.length > 0) {
    for (const key of userAttrKeys) {
      const userVal = userAttrs[key];
      const elVal = elAttrs[key];
      // If user has attribute specified, check if creator attribute for the same key differs
      if (elVal !== undefined && elVal !== null && elVal !== '' && String(userVal) !== String(elVal)) {
        return false;
      }
    }
  }

  return true;
}
