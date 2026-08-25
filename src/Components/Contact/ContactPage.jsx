"use client";

import React, { useState, useEffect } from "react";
import "./ContactPage.css";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ContactPage = () => {
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.mobile) setPhone(user.mobile);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      };

      const res = await api.submitContactMessage(payload);
      if (res.success) {
        toast.success(res.message || "Your message has been sent successfully!");
        setName(user?.name || "");
        setEmail(user?.email || "");
        setPhone(user?.mobile || "");
        setSubject("");
        setMessage("");
      } else {
        toast.error(res.message || "Failed to send message.");
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong while submitting your message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="contactSection">
        <h2>Contact Us</h2>
        <div className="contactMap">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d49206.16593395236!2d2.5776979486328124!3d39.57346430000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x129793280de39c05%3A0x85d5f5ea839d6c2a!2sUOMO!5e0!3m2!1sen!2sin!4v1708798894132!5m2!1sen!2sin"
            width="800"
            height="600"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="uomomap"
          ></iframe>
        </div>
        <div className="contactInfo">
          <div className="contactAddress">
            <div className="address">
              <h3>Store in India</h3>
              <p>
                A-791, A-791, Bandra Reclamation Rd, Mumbai
                <br /> Maharashtra
              </p>
              <p>
                admin@printmyway.com
                <br />
                +91 80 7123 4567
              </p>
            </div>
            <div className="address">
              <h3>Store in Canada</h3>
              <p>
                A-791, A-791, Bandra Reclamation Rd, Toronto
                <br /> Ontario
              </p>
              <p>
                contact@printmyway.com
                <br />
                +1 416 123 4567
              </p>
            </div>
          </div>
          <div className="contactForm">
            <h3>Get In Touch</h3>
            <form onSubmit={handleSubmit}>
              <div className="contactFormRow">
                <input
                  type="text"
                  value={name}
                  placeholder="Name *"
                  onChange={(e) => setName(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <input
                  type="email"
                  value={email}
                  placeholder="Email address *"
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
              </div>
              <div className="contactFormRow">
                <input
                  type="tel"
                  value={phone}
                  placeholder="Phone / Mobile Number"
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  value={subject}
                  placeholder="Subject *"
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
              </div>
              <textarea
                rows={8}
                cols={40}
                placeholder="Your Message *"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button type="submit" disabled={submitting}>
                {submitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
