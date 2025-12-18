export const complaintValidator = {
  canResolve(status: string, resolutionNote: string) {
    if (status === 'resolved' && (!resolutionNote || resolutionNote.length < 5)) {
      return { valid: false, message: "Resolution note is required." };
    }
    return { valid: true };
  },

  canAssign(staff: any, priority: string) {
    if (priority === 'critical' && staff?.role === 'junior') {
       return { valid: false, message: "Critical complaints cannot be assigned to junior staff." };
    }
    return { valid: true };
  }
};