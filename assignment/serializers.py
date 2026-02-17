from rest_framework import serializers
from .models import Ticket

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'
            
    def validate(self, data):
        if data.get('status') == 'resolved' and not data.get('description'):
            raise serializers.ValidationError("Description is required when status is resolved.")
        return data
        