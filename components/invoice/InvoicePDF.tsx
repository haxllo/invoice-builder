'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Invoice } from '@/lib/shared/types/invoice';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#111',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoBox: {
    width: '45%',
  },
  label: {
    fontSize: 8,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 8,
  },
  colDescription: { width: '50%', paddingLeft: 8 },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right', paddingRight: 8 },
  totalsSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: '40%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 8,
    paddingTop: 8,
    fontSize: 14,
    fontWeight: 'black',
  },
  footer: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 20,
  },
  notes: {
    fontSize: 8,
    color: '#666',
    lineHeight: 1.5,
  }
});

export const InvoicePDF = ({ invoice }: { invoice: Invoice }) => {
  const subtotal = (invoice.invoiceItems?.reduce((acc, item) => 
    acc + (item.unitPriceCentsSnapshot * item.quantity), 0) || 0) / 100;
  
  const taxAmount = (subtotal * (invoice.taxRate || 0)) / 100;
  const total = subtotal + taxAmount - ((invoice.discountAmountCents || 0) / 100) + ((invoice.shippingFeeCents || 0) / 100);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Invoice</Text>
            <Text style={{ marginTop: 4 }}>#{invoice.invoiceNumber}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.label}>Issued Date</Text>
            <Text>{new Date(invoice.issuedAt).toLocaleDateString()}</Text>
            {invoice.dueDate && (
              <>
                <Text style={[styles.label, { marginTop: 10 }]}>Due Date</Text>
                <Text>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.bold}>{invoice.businessNameSnapshot}</Text>
            <Text>{invoice.businessAddressSnapshot}</Text>
            <Text>{invoice.businessEmailSnapshot}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.bold}>{invoice.clientNameSnapshot}</Text>
            <Text>{invoice.clientAddressSnapshot}</Text>
            <Text>{invoice.clientEmailSnapshot}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colAmount}>Amount</Text>
          </View>
          {invoice.invoiceItems?.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.itemNameSnapshot}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                {invoice.currencySymbolSnapshot}{(item.unitPriceCentsSnapshot / 100).toFixed(2)}
              </Text>
              <Text style={styles.colAmount}>
                {invoice.currencySymbolSnapshot}{((item.quantity * item.unitPriceCentsSnapshot) / 100).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text>Subtotal</Text>
              <Text>{invoice.currencySymbolSnapshot}{subtotal.toFixed(2)}</Text>
            </View>
            {invoice.taxRate > 0 && (
              <View style={styles.totalRow}>
                <Text>Tax ({invoice.taxRate}%)</Text>
                <Text>{invoice.currencySymbolSnapshot}{taxAmount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.bold}>Total</Text>
              <Text style={styles.bold}>{invoice.currencySymbolSnapshot}{total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {(invoice.customerNotes || invoice.termsConditionNotes) && (
          <View style={styles.footer}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.notes}>{invoice.customerNotes}</Text>
            {invoice.termsConditionNotes && (
              <Text style={[styles.notes, { marginTop: 10 }]}>{invoice.termsConditionNotes}</Text>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};
