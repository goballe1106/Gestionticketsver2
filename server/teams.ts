import axios from 'axios';

export class TeamsService {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private tokenEndpoint: string;
  private graphApiEndpoint: string;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID || '';
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || '';
    this.tenantId = process.env.MICROSOFT_TENANT_ID || '';
    this.tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    this.graphApiEndpoint = 'https://graph.microsoft.com/v1.0';
  }

  private async ensureAccessToken(): Promise<string> {
    // Check if token exists and is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      // Get new token
      const params = new URLSearchParams();
      params.append('client_id', this.clientId);
      params.append('scope', 'https://graph.microsoft.com/.default');
      params.append('client_secret', this.clientSecret);
      params.append('grant_type', 'client_credentials');

      const response = await axios.post(this.tokenEndpoint, params);
      
      this.accessToken = response.data.access_token;
      // Set expiry time (typically 1 hour)
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      console.error('Error obtaining access token:', error);
      throw new Error('Failed to authenticate with Microsoft Teams API');
    }
  }

  // Mock implementation for creating a Teams chat for a ticket
  async createTeamsChatForTicket(ticketNumber: string, title: string, participantIds: string[]): Promise<string> {
    try {
      // This would need to be implemented with actual Microsoft Graph API calls
      // when the actual Microsoft Teams integration is set up
      
      // For now, return a mock channel ID
      return `channel_${ticketNumber}_${Date.now()}`;
    } catch (error) {
      console.error('Error creating Teams chat:', error);
      throw new Error('Failed to create Microsoft Teams chat for ticket');
    }
  }

  // Mock implementation for sending a message to a Teams chat
  async sendMessageToTeamsChat(channelId: string, message: string, sender: string): Promise<void> {
    try {
      // This would need to be implemented with actual Microsoft Graph API calls
      // when the actual Microsoft Teams integration is set up
      
      console.log(`Message sent to channel ${channelId}: ${message} by ${sender}`);
    } catch (error) {
      console.error('Error sending message to Teams chat:', error);
      throw new Error('Failed to send message to Microsoft Teams chat');
    }
  }

  // Additional Teams-related methods would go here
}

export const teamsService = new TeamsService();
