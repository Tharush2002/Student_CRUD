const maxFileSize = 3 * 1024 * 1024;
let toggle = true;
let studentsData = [];
let selectedStudent = null;
let originalProfile;

if (document.getElementById('update-contact-pane')) {
    originalProfile = document.getElementById('update-contact-pane').innerHTML;
    document.getElementById('update-contact-pane').style.display = "none";
}

document.addEventListener('click', () => {
    if (document.getElementById('btnClear')) {
        document.getElementById('btnClear').addEventListener('click', e => {
            e.preventDefault();
            detailForm.reset();
            document.getElementById('profilePicture').src = "./img/profile-pic.jpg"
            document.getElementById('file-input').value = "";
        })
    }

    if (document.getElementById('file-input')) {
        document.getElementById('file-input').addEventListener('change', e => {

            const file = e.target.files[0];
            const profilePicture = document.getElementById('profilePicture');
            const errorMessage = document.getElementById('errorMessage');

            if (file) {
                if (file.size > maxFileSize) {
                    errorMessage.innerText = "File size exceeds 2 MB"
                } else {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        profilePicture.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            }
        })
    }

    if (document.getElementById('inputDOB')) {
        document.getElementById('inputDOB').addEventListener('change', () => {

            console.log("AAAAAAAAAAAAAAAAA");

            let input = document.getElementById('inputDOB').value;

            const birthDate = new Date(input);
            const today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDifference = today.getMonth() - birthDate.getMonth();

            if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            document.getElementById('inputAge').value = age;
        })
    }

    if (document.getElementById('detailForm')) {
        document.getElementById('detailForm').addEventListener('submit', async event => {
            const detailForm = document.getElementById('detailForm');
            if (detailForm.checkValidity()) {
                event.preventDefault();
                await saveStudentToDatabase();
            }
            detailForm.reset();
            document.getElementById('profilePicture').src = "./img/profile-pic.jpg"
            document.getElementById('file-input').value = "";
        })
    }
})

async function editOnAction(e) {
    e.preventDefault();
    if (toggle) {
        document.getElementById('inputName').removeAttribute("disabled")
        document.getElementById('inputEmail').removeAttribute("disabled")
        document.getElementById('inputAddress').removeAttribute("disabled")
        document.getElementById('inputPrimaryPhoneNumber').removeAttribute("disabled")
        document.getElementById('btnAddSecondaryNumber').removeAttribute("disabled")
        if (document.getElementById('inputSecondaryPhoneNumber')) {
            document.getElementById('btnAddSecondaryNumber').setAttribute("disabled", 'true')
            document.getElementById('btnRemoveSecondaryNumber').removeAttribute("disabled")
            document.getElementById('inputSecondaryPhoneNumber').removeAttribute("disabled")
        }
        document.getElementById('inputDOB').removeAttribute("disabled")
        document.getElementById('inputGender').removeAttribute("disabled")
        document.getElementById('file-input').removeAttribute("disabled")

        document.getElementById('inputAge').removeAttribute("disabled")

        document.getElementById('btnEditStudent').innerText = "Save Changes";
    } else {
        document.getElementById('update-contact-pane').style.display = "none";
        document.getElementById('loadingScreen').style.visibility = "visible";
        await updateStudentFromDatabase(selectedStudent.id);
        await loadStudents();
        document.getElementById('loadingScreen').style.visibility = "hidden";
        setTimeout(() => {
            location.reload();
        }, 1500);

    }
    toggle = !toggle;
}

function addSecondaryNumber() {
    const secondaryNumber = document.getElementById('secondaryNumber');
    document.getElementById('btnAddSecondaryNumber').disabled = true;
    const number = `<div class="form-group col-10 mt-3">
                    <label for="phoneNumber">Secondary Phone Number :</label>
                    <input
                      type="tel"
                      class="form-control"
                      pattern="^(\\d{10}|(\\+\\d{11,15}))$"
                      id="inputSecondaryPhoneNumber"
                      placeholder="xxxxxxxxxx or +xxxxxxxxxx"
                      required
                    />
                  </div>
                  <div class="col-2 mt-2 d-flex align-items-end justify-content-end"><button class="btn btn-danger rounded-3 border border-danger border-2" id="btnRemoveSecondaryNumber" onclick="removeSecondaryNumber()"><i class="bi bi-dash-square-fill text-light h4"></i></button></div>`;
    secondaryNumber.innerHTML = number;
}

function removeSecondaryNumber() {
    const secondaryNumber = document.getElementById('secondaryNumber');
    secondaryNumber.replaceChildren();
    document.getElementById('btnAddSecondaryNumber').disabled = false;
}

async function saveStudentToDatabase() {
    const name = document.getElementById('inputName').value;
    const age = parseInt(document.getElementById('inputAge').value);
    const email = document.getElementById('inputEmail').value;
    const address = document.getElementById('inputAddress').value;
    const gender = document.getElementById('inputGender').value;
    const dob = document.getElementById('inputDOB').value;
    let contacts = [document.getElementById('inputPrimaryPhoneNumber').value];
    if (document.getElementById('inputSecondaryPhoneNumber')) {
        contacts.push(document.getElementById('inputSecondaryPhoneNumber').value)
    }

    const file = document.getElementById('file-input').files[0];

    if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const formData = {
                id: null,
                name: name,
                age: age,
                email: email,
                address: address,
                gender: gender,
                dob: dob,
                contacts: contacts,
                profile: {
                    profilePicture: Array.from(new Uint8Array(reader.result)),
                    imageType: file.type
                }
            };

            fetch('http://localhost:8080/students/save', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data == true) {
                        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToast'));
                        toastBootstrap.show()
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('errorToast'));
                    toastBootstrap.show()
                });
        };
        reader.readAsArrayBuffer(file);
    } else {
        const formData = {
            id: null,
            name: name,
            age: age,
            email: email,
            address: address,
            gender: gender,
            dob: dob,
            contacts: contacts,
            profile: {
                profilePicture: null,
                imageType: null
            }
        };

        fetch('http://localhost:8080/students/save', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data == true) {
                    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('liveToast'));
                    toastBootstrap.show()
                }
            })
            .catch(error => {
                console.error('Error:', error);
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('errorToast'));
                toastBootstrap.show()
            });
    }
}

async function updateStudentFromDatabase(id) {
    const name = document.getElementById('inputName').value;
    const age = parseInt(document.getElementById('inputAge').value);
    const email = document.getElementById('inputEmail').value;
    const address = document.getElementById('inputAddress').value;
    const gender = document.getElementById('inputGender').value;
    const dob = document.getElementById('inputDOB').value;
    let contacts = [document.getElementById('inputPrimaryPhoneNumber').value];
    if (document.getElementById('inputSecondaryPhoneNumber')) {
        contacts.push(document.getElementById('inputSecondaryPhoneNumber').value)
    }

    const file = document.getElementById('file-input').files[0];

    if (file) {
        const reader = new FileReader();
        reader.onloadend = function () {
            const formData = {
                id: null,
                name: name,
                age: age,
                email: email,
                address: address,
                gender: gender,
                dob: dob,
                contacts: contacts,
                profile: {
                    profilePicture: Array.from(new Uint8Array(reader.result)),
                    imageType: file.type
                }
            };

            fetch(`http://localhost:8080/students/${id}/update`, {
                method: 'PUT',
                body: JSON.stringify(formData),
                headers: new Headers({
                    'Content-Type': 'application/json'
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data == true) {
                        const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('editToast'));
                        toastBootstrap.show()
                    }
                })
                .catch(error => console.error('Error:', error));
        };
        reader.readAsArrayBuffer(file);
    } else {
        const formData = {
            id: null,
            name: name,
            age: age,
            email: email,
            address: address,
            gender: gender,
            dob: dob,
            contacts: contacts
        };

        fetch(`http://localhost:8080/students/${id}/update`, {
            method: 'PUT',
            body: JSON.stringify(formData),
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data == true) {
                    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('editToast'));
                    toastBootstrap.show()
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

async function getStudentsFromDatabase() {
    await fetch('http://localhost:8080/students/get')
        .then(res => res.json())
        .then(data => {
            studentsData = data;
        })
}

async function loadStudents() {
    await getStudentsFromDatabase();
    
    const tableBody = document.getElementById('tableBody')
    tableBody.replaceChildren();
    if (studentsData.length != 0) {
        let temp = "";
        studentsData.forEach(element => {
            let contacts = "";
            element.contacts.forEach(contactElement => {
                contacts += " " + contactElement + " /";
            });
            contacts = contacts.slice(0, -1);
            temp += `<tr id="${element.id}" onclick="displayStudent(this.id)">
                <td>${element.name}</td>
                <td>${element.age}</td>
                <td>${element.email}</td>
                <td>${element.address}</td>
                <td>${element.gender}</td>
                <td>${element.dob}</td>
                <td>${contacts}</td>
              </tr>`
        });
        tableBody.innerHTML = temp;
    } else {
        document.getElementById('noStudents').style.visibility="visible"
    }
    document.getElementById('loadingScreen').style.visibility = "hidden";
    document.getElementById('update-contact-container').style.visibility = "visible"
}

function displayStudent(id) {
    document.getElementById('update-contact-pane').replaceChildren();
    document.getElementById('update-contact-pane').innerHTML = originalProfile;

    document.getElementById('loadingScreen').style.visibility = "visible";
    document.getElementById('update-contact-pane').style.display = "block";

    L: for (let index = 0; index < studentsData.length; index++) {
        if (studentsData[index].id == id) {
            selectedStudent = studentsData[index];
            break L;
        }
    }

    document.getElementById('inputName').value = selectedStudent.name;
    document.getElementById('inputEmail').value = selectedStudent.email;
    document.getElementById('inputAddress').value = selectedStudent.address;
    document.getElementById('inputPrimaryPhoneNumber').value = selectedStudent.contacts[0];

    if (selectedStudent.contacts.length > 1) {
        addSecondaryNumber();
        const inputSecondaryPhoneNumber = document.getElementById('inputSecondaryPhoneNumber');
        inputSecondaryPhoneNumber.setAttribute('disabled', "true")
        inputSecondaryPhoneNumber.value = selectedStudent.contacts[1];
        document.getElementById('btnRemoveSecondaryNumber').setAttribute('disabled', "true")
    }

    document.getElementById('inputDOB').value = selectedStudent.dob;
    document.getElementById('inputGender').value = selectedStudent.gender;
    document.getElementById('inputAge').value = selectedStudent.age;

    if (selectedStudent.profile.imageType != null) {
        const imgSrc = `data:${selectedStudent.profile.imageType};base64,${selectedStudent.profile.profilePicture}`;
        document.getElementById('profilePicture').src = imgSrc;
    }

    document.getElementById('loadingScreen').style.visibility = "hidden";
}

async function btnDeleteStudentFromDatabase(e) {
    e.preventDefault();
    await fetch(`http://localhost:8080/students/${selectedStudent.id}/delete`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                document.getElementById('update-contact-pane').style.display = "none";
                document.getElementById('loadingScreen').style.visibility = "visible";
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(document.getElementById('deleteToast'));
                toastBootstrap.show()
                loadStudents();
                document.getElementById('loadingScreen').style.visibility = "hidden";
            } else {
                console.error('Failed to delete student:', response.statusText);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}