function handleSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.name.value;
    const email = form.email.value;
    const subject = form.subject.value;
    const message = form.message.value;
    
    // Create mailto link
    const mailtoLink = `mailto:mariaajames280@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    )}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    showMessage('Opening your email client...', 'success');
    
    // Reset form after a delay
    setTimeout(() => {
        form.reset();
    }, 1000);
    
    return false;
}
