        // Form Modal Functionality
        function openFormModal(formType) {
            const modal = document.getElementById('formModal');
            const modalContent = document.getElementById('modalContent');
            
            let formHTML = '';
            const today = new Date();
            const formattedDate = today.toLocaleDateString('en-GB');
            
            switch(formType) {
                case 'studentId':
                    formHTML = `
                        <h2 style="color: var(--primary-color); margin-bottom: 20px;">Student ID Card</h2>
                        <div class="printable-form" id="printableIdCard">
                            <div style="border: 2px solid #000; padding: 20px; margin: 0 auto; font-family: Arial, sans-serif;">
                                <div style="text-align: center; border-bottom: 2px solid var(--primary-color); padding-bottom: 15px;">
                                    <h3 style="color: var(--primary-color); margin: 0;">AL'ANSAR ACADEMY DEDERI</h3>
                                    <p style="margin: 5px 0;">Dederi, Karaye LGA, Kano State</p>
                                    <p style="margin: 5px 0; font-weight: bold;">STUDENT IDENTITY CARD</p>
                                </div>
                                
                                <div style="display: flex; margin-top: 20px;">
                                    <div style="width: 120px; height: 140px; background-color: #f0f0f0; border: 1px solid #ccc; display: flex; align-items: center; justify-content: center;">
                                        <span style="color: #999;">[Student Photo]</span>
                                    </div>
                                    <div style="margin-left: 20px; flex: 1;">
                                        <p><strong>Name:</strong> _______________________</p>
                                        <p><strong>Class:</strong> _______________________</p>
                                        <p><strong>Admission No:</strong> _______________</p>
                                        <p><strong>Valid Till:</strong> Dec ${today.getFullYear() + 1}</p>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 20px;">
                                    <p><strong>Emergency Contact:</strong> _______________________</p>
                                    <p><strong>Phone:</strong> _______________________</p>
                                </div>
                                
                                <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="border-top: 1px solid #000; width: 150px; padding-top: 5px;">
                                            <p style="margin: 0; font-size: 0.9rem;">Student's Signature</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div style="border-top: 1px solid #000; width: 150px; padding-top: 5px; text-align: center;">
                                            <p style="margin: 0; font-size: 0.9rem;">Headmaster's Signature</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="text-align: center; margin-top: 20px; font-size: 0.8rem;">
                                    <p>This card is property of Al'Ansar Academy Dederi. If found, please return to the school.</p>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <button class="form-btn" onclick="printForm('printableIdCard')"><i class="fas fa-print"></i> Print ID Card</button>
                            <button class="form-btn" style="background-color: var(--accent-color);" onclick="downloadForm('student_id_card')"><i class="fas fa-download"></i> Download as PDF</button>
                        </div>
                    `;
                    break;
                    
                case 'admission':
                    formHTML = `
                        <h2 style="color: var(--primary-color); margin-bottom: 20px;">New Student Admission Form</h2>
                        <div class="printable-form" id="printableAdmissionForm">
                            <h3 style="text-align: center; color: var(--primary-color);">AL'ANSAR ACADEMY DEDERI - STUDENT ADMISSION FORM</h3>
                            <p style="text-align: center;">Dederi, Karaye LGA, Kano State | Date: ${formattedDate}</p>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">STUDENT INFORMATION</h4>
                                <table style="width: 100%; margin-top: 15px;">
                                    <tr><td width="30%">Full Name:</td><td>________________________________________</td></tr>
                                    <tr><td>Date of Birth:</td><td>________________ Age: ______</td></tr>
                                    <tr><td>Gender:</td><td>□ Male □ Female</td></tr>
                                    <tr><td>Class Applied For:</td><td>□ Pre-nursery □ Nursery 1 □ Nursery 2 □ Basic 1 □ Basic 2</td></tr>
                                    <tr><td>Previous School (if any):</td><td>________________________________________</td></tr>
                                    <tr><td>Reason for Transfer:</td><td>________________________________________</td></tr>
                                </table>
                            </div>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">PARENT/GUARDIAN INFORMATION</h4>
                                <table style="width: 100%; margin-top: 15px;">
                                    <tr><td width="30%">Father's Name:</td><td>________________________________________</td></tr>
                                    <tr><td>Occupation:</td><td>________________ Phone: ________________</td></tr>
                                    <tr><td>Mother's Name:</td><td>________________________________________</td></tr>
                                    <tr><td>Occupation:</td><td>________________ Phone: ________________</td></tr>
                                    <tr><td>Home Address:</td><td>________________________________________</td></tr>
                                    <tr><td></td><td>________________________________________</td></tr>
                                    <tr><td>Email Address:</td><td>________________________________________</td></tr>
                                </table>
                            </div>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">EMERGENCY CONTACT (OTHER THAN PARENTS)</h4>
                                <table style="width: 100%; margin-top: 15px;">
                                    <tr><td width="30%">Name:</td><td>________________________________________</td></tr>
                                    <tr><td>Relationship:</td><td>________________ Phone: ________________</td></tr>
                                    <tr><td>Address:</td><td>________________________________________</td></tr>
                                </table>
                            </div>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">MEDICAL INFORMATION</h4>
                                <p>Any known allergies or medical conditions: ________________________________</p>
                                <p>Medications regularly taken: ___________________________________________</p>
                                <p>Doctor's Name: ________________________ Phone: ___________________</p>
                            </div>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">DECLARATION</h4>
                                <p>I hereby declare that the information provided is true and correct. I agree to abide by the rules and regulations of Al'Ansar Academy Dederi.</p>
                                
                                <div style="display: flex; justify-content: space-between; margin-top: 40px;">
                                    <div>
                                        <p>__________________________</p>
                                        <p>Parent/Guardian Signature</p>
                                    </div>
                                    <div>
                                        <p>__________________________</p>
                                        <p>Date</p>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 40px; text-align: center; font-style: italic;">
                                    <p>For Office Use Only</p>
                                    <p>Admission No: _______________ Date of Admission: _______________</p>
                                    <p>Class Assigned: _______________ Approved By: ___________________</p>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <button class="form-btn" onclick="printForm('printableAdmissionForm')"><i class="fas fa-print"></i> Print Form</button>
                            <button class="form-btn" style="background-color: var(--accent-color);" onclick="downloadForm('admission_form')"><i class="fas fa-download"></i> Download</button>
                        </div>
                    `;
                    break;
                    
                case 'teacherApp':
                    formHTML = `
                        <h2 style="color: var(--primary-color); margin-bottom: 20px;">Teacher Application Form</h2>
                        <div class="printable-form" id="printableTeacherApp">
                            <h3 style="text-align: center; color: var(--primary-color);">AL'ANSAR ACADEMY DEDERI - TEACHER APPLICATION FORM</h3>
                            <p style="text-align: center;">Dederi, Karaye LGA, Kano State | Date: ${formattedDate}</p>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">PERSONAL INFORMATION</h4>
                                <table style="width: 100%; margin-top: 15px;">
                                    <tr><td width="30%">Full Name:</td><td>________________________________________</td></tr>
                                    <tr><td>Date of Birth:</td><td>________________ Age: ______</td></tr>
                                    <tr><td>Gender:</td><td>□ Male □ Female □ Other</td></tr>
                                    <tr><td>Marital Status:</td><td>□ Single □ Married □ Divorced □ Widowed</td></tr>
                                    <tr><td>Nationality:</td><td>________________ State of Origin: _____________</td></tr>
                                    <tr><td>Local Govt. Area:</td><td>________________________</td></tr>
                                    <tr><td>Home Address:</td><td>________________________________________</td></tr>
                                    <tr><td>Phone Number:</td><td>________________ Email: ___________________</td></tr>
                                </table>
                            </div>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">EDUCATIONAL QUALIFICATIONS</h4>
                                <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                                    <tr style="background-color: #f0f0f0;">
                                        <th style="border: 1px solid #ddd; padding: 8px;">Institution</th>
                                        <th style="border: 1px solid #ddd; padding: 8px;">Qualification</th>
                                        <th style="border: 1px solid #ddd; padding: 8px;">Year</th>
                                    </tr>
                                    <tr><td style="border: 1px solid #ddd; padding: 8px;">________________________</td><td style="border: 1px solid #ddd; padding: 8px;">________________________</td><td style="border: 1px solid #ddd; padding: 8px;">________</td></tr>
                                    <tr><td style="border: 1px solid #ddd; padding: 8px;">________________________</td><td style="border: 1px solid #ddd; padding: 8px;">________________________</td><td style="border: 1px solid #ddd; padding: 8px;">________</td></tr>
                                    <tr><td style="border: 1px solid #ddd; padding: 8px;">________________________</td><td style="border: 1px solid #ddd; padding: 8px;">________________________</td><td style="border: 1px solid #ddd; padding: 8px;">________</td></tr>
                                </table>
                            </div>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">TEACHING EXPERIENCE</h4>
                                <p>Subject(s) you can teach: _______________________________________________</p>
                                <p>Classes you prefer to teach: ____________________________________________</p>
                                <p>Years of teaching experience: _______ Previous school(s): _________________</p>
                            </div>
                            
                            <div style="margin-top: 30px;">
                                <h4 style="color: var(--dark-color); border-bottom: 1px solid #ddd; padding-bottom: 5px;">REFEREES (Provide 2 references)</h4>
                                <p>1. Name: ________________________ Position: ___________________</p>
                                <p>Organization: ____________________ Phone: ___________________</p>
                                <p>2. Name: ________________________ Position: ___________________</p>
                                <p>Organization: ____________________ Phone: ___________________</p>
                            </div>
                            
                            <div style="margin-top: 40px;">
                                <p><strong>Declaration:</strong> I declare that all information provided is true and accurate.</p>
                                <div style="display: flex; justify-content: space-between; margin-top: 40px;">
                                    <div>
                                        <p>__________________________</p>
                                        <p>Applicant's Signature</p>
                                    </div>
                                    <div>
                                        <p>__________________________</p>
                                        <p>Date</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <button class="form-btn" onclick="printForm('printableTeacherApp')"><i class="fas fa-print"></i> Print Form</button>
                            <button class="form-btn" style="background-color: var(--accent-color);" onclick="downloadForm('teacher_application')"><i class="fas fa-download"></i> Download</button>
                        </div>
                    `;
                    break;
                    
                case 'announcement':
                    formHTML = `
                        <h2 style="color: var(--primary-color); margin-bottom: 20px;">Parent Announcement Form</h2>
                        <div class="printable-form" id="printableAnnouncement">
                            <div style="border: 2px solid var(--primary-color); padding: 30px; max-width: 800px; margin: 0 auto;">
                                <div style="text-align: center; margin-bottom: 30px;">
                                    <h2 style="color: var(--primary-color); margin: 0;">AL'ANSAR ACADEMY DEDERI</h2>
                                    <p style="margin: 5px 0;">Dederi, Karaye LGA, Kano State</p>
                                    <p style="margin: 5px 0; font-weight: bold;">OFFICIAL ANNOUNCEMENT</p>
                                    <p style="margin: 5px 0;">Date: ${formattedDate}</p>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <h3 style="color: var(--dark-color); border-bottom: 2px solid var(--secondary-color); display: inline-block; padding-bottom: 5px;">ANNOUNCEMENT TITLE</h3>
                                </div>
                                
                                <div style="margin: 30px 0;">
                                    <p>Dear Parents/Guardians,</p>
                                    <p style="margin-top: 20px; line-height: 1.8;">
                                        This is to inform you that ________________________________________________________________
                                        ________________________________________________________________________________________
                                        ________________________________________________________________________________________
                                        ________________________________________________________________________________________
                                        ________________________________________________________________________________________
                                        ________________________________________________________________________________________
                                    </p>
                                    <p style="margin-top: 20px; line-height: 1.8;">
                                        Details: ________________________________________________________________________________
                                        ________________________________________________________________________________________
                                        ________________________________________________________________________________________
                                        ________________________________________________________________________________________
                                    </p>
                                    <p style="margin-top: 20px; line-height: 1.8;">
                                        Date: ________________________ Time: ________________________ Venue: _______________________
                                    </p>
                                </div>
                                
                                <div style="margin-top: 40px;">
                                    <p>Thank you for your cooperation.</p>
                                    <p>Sincerely,</p>
                                    
                                    <div style="margin-top: 30px;">
                                        <p>__________________________</p>
                                        <p>M. ABDULKARIM MUSA</p>
                                        <p>Headmaster/Proprietor</p>
                                        <p>Al'Ansar Academy Dederi</p>
                                        <p>08033073265</p>
                                    </div>
                                </div>
                                
                                <div style="margin-top: 50px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid var(--accent-color); font-size: 0.9rem;">
                                    <p><strong>Note:</strong> Please acknowledge receipt of this announcement by signing below and returning the lower portion to the class teacher.</p>
                                    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                                        <div>
                                            <p>__________________________</p>
                                            <p>Parent/Guardian Signature</p>
                                        </div>
                                        <div>
                                            <p>__________________________</p>
                                            <p>Student's Name & Class</p>
                                        </div>
                                        <div>
                                            <p>__________________________</p>
                                            <p>Date</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <button class="form-btn" onclick="printForm('printableAnnouncement')"><i class="fas fa-print"></i> Print Announcement</button>
                            <button class="form-btn" style="background-color: var(--accent-color);" onclick="downloadForm('announcement_form')"><i class="fas fa-download"></i> Download</button>
                        </div>
                    `;
                    break;
                    
                default:
                    formHTML = `<h2>Form Template</h2><p>This form template will be available soon.</p>`;
            }
            
            modalContent.innerHTML = formHTML;
            modal.style.display = 'block';
        }
        
        function closeFormModal() {
            document.getElementById('formModal').style.display = 'none';
        }
        
        function printForm(elementId) {
            const printContent = document.getElementById(elementId).innerHTML;
            const originalContent = document.body.innerHTML;
            
            document.body.innerHTML = printContent;
            window.print();
            document.body.innerHTML = originalContent;
            location.reload(); // Reload to restore functionality
        }
        
        function downloadForm(formName) {
            alert(`In a real application, the "${formName}" would be downloaded as a PDF file. For now, please use the print function.`);
            // In a real implementation, this would generate and download a PDF
        }
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            const modal = document.getElementById('formModal');
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }